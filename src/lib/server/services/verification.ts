import { randomUUID } from 'node:crypto';
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { IdType, VerificationStatus } from '#lib/domain/enums.ts';
import { type Actor, canSubmitVerification, isAdmin } from '#lib/domain/user.ts';
import { db } from '#lib/server/db/index.ts';
import { locations, users, userVerifications } from '#lib/server/db/schema/index.ts';
import { forbidden, notFound, ServiceError } from '#lib/server/errors.ts';
import { normaliseDocumentPhoto, readImageUpload } from '#lib/server/images.ts';
import { limits } from '#lib/server/rate-limit.ts';
import { privateStore } from '#lib/server/storage.ts';
import { writeAudit } from './audit.ts';
import { notify } from './notifications.ts';

export const ID_TYPE_LABELS: Record<IdType, string> = {
	NATIONAL_ID: 'Philippine National ID (PhilSys)',
	DRIVERS_LICENSE: "Driver's License",
	PASSPORT: 'Passport',
	UMID: 'UMID',
	OTHER_GOVERNMENT_ID: 'Other government-issued ID'
};

/** The user's own most recent submission. Status and dates only, never the images. */
export async function getLatestSubmission(userId: string) {
	const [row] = await db
		.select({
			id: userVerifications.id,
			idType: userVerifications.idType,
			status: userVerifications.status,
			rejectionReason: userVerifications.rejectionReason,
			createdAt: userVerifications.createdAt,
			reviewedAt: userVerifications.reviewedAt
		})
		.from(userVerifications)
		.where(eq(userVerifications.userId, userId))
		.orderBy(desc(userVerifications.createdAt))
		.limit(1);
	return row ?? null;
}

export interface SubmitInput {
	idType: IdType;
	front: unknown;
	back: unknown;
}

/** Spec §10: stores the ID photos privately and moves the user to PENDING. */
export async function submitVerification(actor: Actor, input: SubmitInput) {
	if (!canSubmitVerification(actor)) {
		throw new ServiceError(
			'CANNOT_SUBMIT',
			actor.verificationStatus === 'PENDING'
				? 'Your ID is already being reviewed.'
				: 'Your account is already verified.',
			409
		);
	}
	limits.upload.consume(`upload:${actor.id}`);

	const front = await normaliseDocumentPhoto(
		await readImageUpload(input.front, 'the front of your ID', 'front')
	);
	const hasBack = input.back instanceof File && input.back.size > 0;
	const back = hasBack
		? await normaliseDocumentPhoto(await readImageUpload(input.back, 'the back of your ID', 'back'))
		: null;

	const id = randomUUID();
	const frontKey = `verifications/${actor.id}/${id}-front.jpg`;
	const backKey = back ? `verifications/${actor.id}/${id}-back.jpg` : null;
	await privateStore.put(frontKey, front, 'image/jpeg');
	if (back && backKey) await privateStore.put(backKey, back, 'image/jpeg');

	try {
		await db.transaction(async (tx) => {
			const updated = await tx
				.update(users)
				.set({ verificationStatus: 'PENDING' })
				.where(
					and(
						eq(users.id, actor.id),
						eq(users.status, 'ACTIVE'),
						inArray(users.verificationStatus, ['UNVERIFIED', 'REJECTED'])
					)
				)
				.returning({ id: users.id });
			if (updated.length === 0) {
				throw new ServiceError('CANNOT_SUBMIT', 'Your ID is already being reviewed.', 409);
			}
			await tx.insert(userVerifications).values({
				id,
				userId: actor.id,
				idType: input.idType,
				frontImageKey: frontKey,
				backImageKey: backKey,
				status: 'PENDING'
			});
		});
	} catch (e) {
		// Don't leave orphaned ID images behind if the database step failed.
		await privateStore.delete(frontKey);
		if (backKey) await privateStore.delete(backKey);
		throw e;
	}
}

// ── Admin ────────────────────────────────────────────────────────────────────

function assertAdmin(actor: Actor) {
	if (!isAdmin(actor)) throw forbidden();
}

export async function listSubmissions(actor: Actor, status: VerificationStatus) {
	assertAdmin(actor);
	return db
		.select({
			id: userVerifications.id,
			idType: userVerifications.idType,
			status: userVerifications.status,
			createdAt: userVerifications.createdAt,
			reviewedAt: userVerifications.reviewedAt,
			userId: users.id,
			name: users.name,
			username: users.username,
			municipality: locations.name
		})
		.from(userVerifications)
		.innerJoin(users, eq(users.id, userVerifications.userId))
		.innerJoin(locations, eq(locations.id, users.municipalityId))
		.where(eq(userVerifications.status, status))
		.orderBy(
			status === 'PENDING' ? userVerifications.createdAt : desc(userVerifications.reviewedAt)
		)
		.limit(100);
}

export async function getSubmissionForReview(actor: Actor, id: string) {
	assertAdmin(actor);
	const [row] = await db
		.select({
			id: userVerifications.id,
			idType: userVerifications.idType,
			status: userVerifications.status,
			rejectionReason: userVerifications.rejectionReason,
			hasFront: userVerifications.frontImageKey,
			hasBack: userVerifications.backImageKey,
			documentsPurgedAt: userVerifications.documentsPurgedAt,
			createdAt: userVerifications.createdAt,
			reviewedAt: userVerifications.reviewedAt,
			user: {
				id: users.id,
				name: users.name,
				username: users.username,
				email: users.email,
				mobileNumber: users.mobileNumber,
				status: users.status,
				createdAt: users.createdAt,
				municipality: locations.name
			}
		})
		.from(userVerifications)
		.innerJoin(users, eq(users.id, userVerifications.userId))
		.innerJoin(locations, eq(locations.id, users.municipalityId))
		.where(eq(userVerifications.id, id));
	if (!row) throw notFound('Submission');
	return {
		...row,
		hasFront: Boolean(row.hasFront),
		hasBack: Boolean(row.hasBack)
	};
}

/** Streams one ID image to an admin and records that it was viewed. */
export async function readDocument(actor: Actor, id: string, side: 'front' | 'back') {
	assertAdmin(actor);
	const [row] = await db
		.select({
			userId: userVerifications.userId,
			frontImageKey: userVerifications.frontImageKey,
			backImageKey: userVerifications.backImageKey
		})
		.from(userVerifications)
		.where(eq(userVerifications.id, id));
	const key = side === 'front' ? row?.frontImageKey : row?.backImageKey;
	if (!row || !key) throw notFound('Document');
	const object = await privateStore.get(key);
	if (!object) throw notFound('Document');
	await writeAudit(db, {
		actorId: actor.id,
		action: 'VIEW_VERIFICATION_DOCUMENT',
		targetType: 'VERIFICATION',
		targetId: id,
		metadata: { side, userId: row.userId }
	});
	return object;
}

export async function reviewSubmission(
	actor: Actor,
	id: string,
	decision: 'approve' | 'reject',
	reason: string | null
) {
	assertAdmin(actor);
	if (decision === 'reject' && !reason?.trim()) {
		throw new ServiceError(
			'REASON_REQUIRED',
			'Give the user a reason for the rejection.',
			422,
			'reason'
		);
	}
	const now = new Date();
	const approved = decision === 'approve';

	await db.transaction(async (tx) => {
		const [submission] = await tx
			.update(userVerifications)
			.set({
				status: approved ? 'VERIFIED' : 'REJECTED',
				rejectionReason: approved ? null : reason!.trim(),
				reviewedById: actor.id,
				reviewedAt: now
			})
			.where(and(eq(userVerifications.id, id), eq(userVerifications.status, 'PENDING')))
			.returning({ userId: userVerifications.userId });
		if (!submission) {
			throw new ServiceError('ALREADY_REVIEWED', 'This submission was already reviewed.', 409);
		}

		await tx
			.update(users)
			.set({
				verificationStatus: approved ? 'VERIFIED' : 'REJECTED',
				verifiedAt: approved ? now : null
			})
			.where(eq(users.id, submission.userId));

		await writeAudit(tx, {
			actorId: actor.id,
			action: approved ? 'APPROVE_USER' : 'REJECT_USER',
			targetType: 'USER',
			targetId: submission.userId,
			reason: approved ? null : reason!.trim(),
			metadata: { verificationId: id }
		});

		await notify(tx, {
			userId: submission.userId,
			type: approved ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
			title: approved ? 'You are now verified ✓' : 'ID verification was not approved',
			body: approved
				? 'You can now post listings and request to buy.'
				: `Reason: ${reason!.trim()} You can submit a new photo of your ID.`,
			href: approved ? '/items/create' : '/verify',
			refType: 'VERIFICATION',
			refId: id
		});
	});
}
