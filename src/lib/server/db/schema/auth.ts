import { boolean, index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { locations } from './locations';
import { createdAt, tstz, updatedAt, userRole, userStatus, verificationStatus } from './_shared';

/**
 * Better Auth's user model (modelName `users`) plus BILIDITO fields.
 * `role`, `status` and `verificationStatus` are declared `input: false` in auth.ts and are only
 * changed by admin services. Clients can never set them.
 */
export const users = pgTable(
	'users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		/** Full name. */
		name: text('name').notNull(),
		email: text('email').notNull().unique(),
		emailVerified: boolean('email_verified').notNull().default(false),
		/** Profile picture URL (public bucket). */
		image: text('image'),
		/** Lower-cased by the Better Auth username plugin. */
		username: text('username').unique(),
		mobileNumber: text('mobile_number').notNull(),
		municipalityId: uuid('municipality_id')
			.notNull()
			.references(() => locations.id),
		barangayId: uuid('barangay_id')
			.notNull()
			.references(() => locations.id),
		termsAcceptedAt: tstz('terms_accepted_at').notNull(),
		role: userRole('role').notNull().default('USER'),
		status: userStatus('status').notNull().default('ACTIVE'),
		verificationStatus: verificationStatus('verification_status').notNull().default('UNVERIFIED'),

		// App-managed (not exposed to Better Auth)
		statusReason: text('status_reason'),
		suspendedUntil: tstz('suspended_until'),
		verifiedAt: tstz('verified_at'),
		/** Denormalised counters, updated only inside order/rating service transactions. */
		ratingCount: integer('rating_count').notNull().default(0),
		ratingSum: integer('rating_sum').notNull().default(0),
		completedOrders: integer('completed_orders').notNull().default(0),

		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [
		index('users_status_idx').on(t.status),
		index('users_verification_status_idx').on(t.verificationStatus),
		index('users_municipality_idx').on(t.municipalityId),
		index('users_created_at_idx').on(t.createdAt)
	]
);

export const sessions = pgTable(
	'sessions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		expiresAt: tstz('expires_at').notNull(),
		token: text('token').notNull().unique(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('sessions_user_idx').on(t.userId)]
);

export const accounts = pgTable(
	'accounts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: tstz('access_token_expires_at'),
		refreshTokenExpiresAt: tstz('refresh_token_expires_at'),
		scope: text('scope'),
		/** Scrypt hash managed by Better Auth. */
		password: text('password'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('accounts_user_idx').on(t.userId)]
);

/** Better Auth's short-lived tokens (password reset etc.). Unrelated to ID verification. */
export const authVerifications = pgTable(
	'auth_verifications',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: tstz('expires_at').notNull(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('auth_verifications_identifier_idx').on(t.identifier)]
);
