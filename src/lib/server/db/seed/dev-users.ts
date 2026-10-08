import { randomBytes } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { and, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { UserRole, VerificationStatus } from '../../../domain/enums.ts';
import * as schema from '../schema/index.ts';

type Db = PostgresJsDatabase<typeof schema>;

interface DevUser {
	username: string;
	name: string;
	email: string;
	role: UserRole;
	verificationStatus: VerificationStatus;
	municipality: string;
	mobileNumber: string;
	purpose: string;
}

/** Local test accounts. Emails use the reserved `.test` TLD so they can never reach a real inbox. */
const DEV_USERS: DevUser[] = [
	{
		username: 'admin',
		name: 'BILIDITO Admin',
		email: 'admin@bilidito.test',
		role: 'ADMIN',
		verificationStatus: 'VERIFIED',
		municipality: 'Tuguegarao City',
		mobileNumber: '+639170000001',
		purpose: 'Admin: dashboard, ID verification review, moderation'
	},
	{
		username: 'juan_seller',
		name: 'Juan Dela Cruz',
		email: 'juan@bilidito.test',
		role: 'USER',
		verificationStatus: 'VERIFIED',
		municipality: 'Tuguegarao City',
		mobileNumber: '+639170000002',
		purpose: 'Verified user: can post listings and buy'
	},
	{
		username: 'maria_buyer',
		name: 'Maria Santos',
		email: 'maria@bilidito.test',
		role: 'USER',
		verificationStatus: 'UNVERIFIED',
		municipality: 'Aparri',
		mobileNumber: '+639170000003',
		purpose: 'Unverified user: try the ID verification flow'
	}
];

const randomPassword = () => randomBytes(9).toString('base64url');

/**
 * Creates (or resets the passwords of) the local test accounts. Returns the credentials so the
 * caller can write them to a gitignored file. Never run against production.
 */
export async function seedDevUsers(db: Db) {
	const created: (DevUser & { password: string })[] = [];

	for (const u of DEV_USERS) {
		const municipality = await db.query.locations.findFirst({
			where: and(
				eq(schema.locations.level, 'CITY_MUNICIPALITY'),
				eq(schema.locations.name, u.municipality)
			)
		});
		if (!municipality) throw new Error(`Seed locations first: ${u.municipality} not found`);
		const barangay = await db.query.locations.findFirst({
			where: eq(schema.locations.parentId, municipality.id),
			orderBy: schema.locations.name
		});
		if (!barangay) throw new Error(`No barangays for ${u.municipality}`);

		const password = randomPassword();
		const hash = await hashPassword(password);
		const now = new Date();

		await db.transaction(async (tx) => {
			const [user] = await tx
				.insert(schema.users)
				.values({
					name: u.name,
					email: u.email,
					emailVerified: true,
					username: u.username,
					mobileNumber: u.mobileNumber,
					municipalityId: municipality.id,
					barangayId: barangay.id,
					termsAcceptedAt: now,
					role: u.role,
					verificationStatus: u.verificationStatus,
					verifiedAt: u.verificationStatus === 'VERIFIED' ? now : null
				})
				.onConflictDoUpdate({
					target: schema.users.email,
					set: { role: u.role, status: 'ACTIVE', updatedAt: now }
				})
				.returning({ id: schema.users.id });

			const existing = await tx.query.accounts.findFirst({
				where: and(
					eq(schema.accounts.userId, user.id),
					eq(schema.accounts.providerId, 'credential')
				)
			});
			if (existing) {
				await tx
					.update(schema.accounts)
					.set({ password: hash })
					.where(eq(schema.accounts.id, existing.id));
			} else {
				await tx.insert(schema.accounts).values({
					userId: user.id,
					accountId: user.id,
					providerId: 'credential',
					password: hash
				});
			}
		});

		created.push({ ...u, password });
	}

	return created;
}
