import { BETTER_AUTH_SECRET, ORIGIN } from '$app/env/private';
import { getRequestEvent } from '$app/server';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { USERNAME_PATTERN } from '#lib/domain/user.ts';
import { db } from '#lib/server/db/index.ts';
import { sendEmail } from '#lib/server/email.ts';

export const auth = betterAuth({
	appName: 'BILIDITO',
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	advanced: {
		database: { generateId: 'uuid' }
	},

	// These HTTP endpoints would bypass our own validation (location, consent, mobile number) or let
	// users edit fields we manage ourselves. The same operations go through form actions + services,
	// which call `auth.api.*` server-side (disabledPaths only affects the HTTP router).
	disabledPaths: [
		'/sign-up/email',
		'/update-user',
		'/change-email',
		'/delete-user',
		'/is-username-available'
	],

	user: {
		modelName: 'users',
		additionalFields: {
			mobileNumber: { type: 'string', required: true },
			municipalityId: { type: 'string', required: true },
			barangayId: { type: 'string', required: true },
			termsAcceptedAt: { type: 'date', required: true },
			role: { type: 'string', input: false, defaultValue: 'USER' },
			status: { type: 'string', input: false, defaultValue: 'ACTIVE' },
			verificationStatus: { type: 'string', input: false, defaultValue: 'UNVERIFIED' }
		}
	},
	session: {
		modelName: 'sessions',
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24
	},
	account: { modelName: 'accounts' },
	verification: { modelName: 'authVerifications' },

	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		autoSignIn: true,
		revokeSessionsOnPasswordReset: true,
		resetPasswordTokenExpiresIn: 60 * 60,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: 'Reset your BILIDITO password',
				text: `Hi ${user.name},\n\nSomeone asked to reset your BILIDITO password. Open this link within 1 hour to choose a new one:\n\n${url}\n\nIf this wasn't you, you can ignore this email.`
			});
		}
	},

	// Applies to the remaining /api/auth/* HTTP endpoints. Form actions use our own limiter.
	rateLimit: {
		enabled: true,
		window: 60,
		max: 60,
		customRules: {
			'/sign-in/email': { window: 60, max: 5 },
			'/sign-in/username': { window: 60, max: 5 },
			'/request-password-reset': { window: 300, max: 3 }
		}
	},

	plugins: [
		username({
			minUsernameLength: 3,
			maxUsernameLength: 30,
			displayUsername: false,
			usernameValidator: (value) => USERNAME_PATTERN.test(value)
		}),
		sveltekitCookies(getRequestEvent) // must stay last
	]
});

export type AuthSession = typeof auth.$Infer.Session;
