import { randomUUID } from 'node:crypto';
import { and, count, eq, inArray } from 'drizzle-orm';
import * as z from 'zod';
import type { Actor } from '#lib/domain/user.ts';
import { normalizePhMobile } from '#lib/domain/user.ts';
import { db } from '#lib/server/db/index.ts';
import { listings, locations, users } from '#lib/server/db/schema/index.ts';
import { ServiceError } from '#lib/server/errors.ts';
import { normaliseAvatar, readImageUpload } from '#lib/server/images.ts';
import { limits } from '#lib/server/rate-limit.ts';
import { publicStore } from '#lib/server/storage.ts';
import { assertValidHomeLocation } from './locations.ts';

/**
 * Public profile (spec §13). Selects only public fields: never email, mobile number, barangay or
 * anything verification-related beyond the badge.
 */
export async function getPublicProfile(username: string) {
	const [row] = await db
		.select({
			id: users.id,
			name: users.name,
			username: users.username,
			image: users.image,
			status: users.status,
			verificationStatus: users.verificationStatus,
			createdAt: users.createdAt,
			ratingCount: users.ratingCount,
			ratingSum: users.ratingSum,
			completedOrders: users.completedOrders,
			municipality: locations.name
		})
		.from(users)
		.innerJoin(locations, eq(locations.id, users.municipalityId))
		.where(eq(users.username, username.toLowerCase()));

	// Banned accounts disappear from public view; records are kept (spec §34).
	if (!row || row.status === 'BANNED') return null;

	const [{ n: activeListings }] = await db
		.select({ n: count() })
		.from(listings)
		.where(and(eq(listings.sellerId, row.id), inArray(listings.status, ['ACTIVE', 'RESERVED'])));

	return {
		...row,
		isVerified: row.verificationStatus === 'VERIFIED',
		rating: row.ratingCount ? Math.round((row.ratingSum / row.ratingCount) * 10) / 10 : null,
		activeListings
	};
}

/** The signed-in user's own editable details (includes private fields). */
export async function getOwnAccount(userId: string) {
	const [row] = await db
		.select({
			name: users.name,
			image: users.image,
			username: users.username,
			email: users.email,
			mobileNumber: users.mobileNumber,
			municipalityId: users.municipalityId,
			barangayId: users.barangayId
		})
		.from(users)
		.where(eq(users.id, userId));
	return row ?? null;
}

export const profileUpdateSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Enter your full name.')
		.max(80, 'Name is too long.')
		.regex(/^[\p{L}\p{M} .,'-]+$/u, 'Use letters only.'),
	mobileNumber: z.string().transform((value, ctx) => {
		const normalized = normalizePhMobile(value);
		if (!normalized) {
			ctx.addIssue({ code: 'custom', message: 'Enter a PH mobile number, e.g. 0917 123 4567.' });
			return z.NEVER;
		}
		return normalized;
	}),
	municipalityId: z.uuid('Choose your municipality or city.'),
	barangayId: z.uuid('Choose your barangay.')
});

export async function updateOwnProfile(actor: Actor, input: z.output<typeof profileUpdateSchema>) {
	assertCanEdit(actor);
	await assertValidHomeLocation(input.municipalityId, input.barangayId);
	await db
		.update(users)
		.set({
			name: input.name,
			mobileNumber: input.mobileNumber,
			municipalityId: input.municipalityId,
			barangayId: input.barangayId
		})
		.where(eq(users.id, actor.id));
}

/** Public URL prefix for objects in the public bucket (served by src/routes/media). */
export const MEDIA_PREFIX = '/media/';

function assertCanEdit(actor: Actor) {
	if (actor.status !== 'ACTIVE') {
		throw new ServiceError('RESTRICTED', 'Your account is restricted.', 403);
	}
}

async function deleteOwnedAvatar(userId: string, url: string | null) {
	// Only delete files we stored for this user; never act on an arbitrary URL.
	const prefix = `${MEDIA_PREFIX}avatars/${userId}/`;
	if (url?.startsWith(prefix)) await publicStore.delete(url.slice(MEDIA_PREFIX.length));
}

/** Replaces the user's profile photo. Returns the new public URL. */
export async function updateAvatar(actor: Actor, file: unknown): Promise<string> {
	assertCanEdit(actor);
	limits.upload.consume(`upload:${actor.id}`);
	const avatar = await normaliseAvatar(await readImageUpload(file, 'yourself', 'avatar'));

	const key = `avatars/${actor.id}/${randomUUID()}.webp`;
	await publicStore.put(key, avatar, 'image/webp');
	const url = MEDIA_PREFIX + key;

	const [previous] = await db
		.select({ image: users.image })
		.from(users)
		.where(eq(users.id, actor.id));
	await db.update(users).set({ image: url }).where(eq(users.id, actor.id));
	await deleteOwnedAvatar(actor.id, previous?.image ?? null);
	return url;
}

export async function removeAvatar(actor: Actor) {
	assertCanEdit(actor);
	const [previous] = await db
		.select({ image: users.image })
		.from(users)
		.where(eq(users.id, actor.id));
	await db.update(users).set({ image: null }).where(eq(users.id, actor.id));
	await deleteOwnedAvatar(actor.id, previous?.image ?? null);
}
