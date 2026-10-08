import { APIError } from 'better-auth/api';
import type * as z from 'zod';
import type { registerSchema } from '#lib/schemas/auth.ts';
import { auth } from '#lib/server/auth.ts';
import { ServiceError } from '#lib/server/errors.ts';
import { limits } from '#lib/server/rate-limit.ts';
import { assertValidHomeLocation } from './locations.ts';

/** Better Auth error codes → user-facing messages, optionally tied to a form field. */
const AUTH_ERRORS: Record<string, { message: string; field?: string; status?: 409 | 401 | 422 }> = {
	USER_ALREADY_EXISTS: {
		message: 'An account with this email already exists.',
		field: 'email',
		status: 409
	},
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
		message: 'An account with this email already exists.',
		field: 'email',
		status: 409
	},
	USERNAME_IS_ALREADY_TAKEN: {
		message: 'That username is taken. Try another.',
		field: 'username',
		status: 409
	},
	INVALID_USERNAME: { message: 'That username is not allowed.', field: 'username', status: 422 },
	INVALID_EMAIL_OR_PASSWORD: {
		message: 'Incorrect email/username or password.',
		status: 401
	},
	INVALID_USERNAME_OR_PASSWORD: {
		message: 'Incorrect email/username or password.',
		status: 401
	},
	INVALID_PASSWORD: {
		message: 'Your current password is incorrect.',
		field: 'currentPassword',
		status: 401
	},
	INVALID_TOKEN: {
		message: 'This reset link is invalid or has expired. Request a new one.',
		status: 422
	}
};

/** Re-throws Better Auth APIErrors as ServiceErrors with friendly messages. */
async function callAuth<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (e) {
		if (e instanceof APIError) {
			const code = (e.body as { code?: string } | undefined)?.code ?? '';
			const known = AUTH_ERRORS[code];
			if (known) throw new ServiceError(code, known.message, known.status ?? 400, known.field);
			throw new ServiceError(code || 'AUTH_ERROR', e.message || 'Something went wrong.', 400);
		}
		throw e;
	}
}

export type RegisterInput = z.output<typeof registerSchema>;

/** Creates an account and signs the user in (session cookie set via the sveltekitCookies plugin). */
export async function register(input: RegisterInput, clientIp: string) {
	limits.register.consume(`register:${clientIp}`);
	await assertValidHomeLocation(input.municipalityId, input.barangayId);

	await callAuth(() =>
		auth.api.signUpEmail({
			body: {
				name: input.name,
				email: input.email,
				password: input.password,
				username: input.username,
				mobileNumber: input.mobileNumber,
				municipalityId: input.municipalityId,
				barangayId: input.barangayId,
				termsAcceptedAt: new Date()
			}
		})
	);
}

/** Signs in with an email or a username. */
export async function login(identifier: string, password: string, clientIp: string) {
	const key = identifier.trim().toLowerCase();
	limits.login.consume(`login:${clientIp}`);
	limits.login.consume(`login:${key}`);

	if (key.includes('@')) {
		await callAuth(() => auth.api.signInEmail({ body: { email: key, password } }));
	} else {
		await callAuth(() => auth.api.signInUsername({ body: { username: key, password } }));
	}
}

/**
 * Sends a reset link if the email has an account. Always resolves the same way, so the response
 * never reveals whether an email is registered.
 */
export async function requestPasswordReset(email: string, clientIp: string) {
	limits.passwordReset.consume(`reset:${clientIp}`);
	limits.passwordReset.consume(`reset:${email}`);
	try {
		await auth.api.requestPasswordReset({ body: { email, redirectTo: '/reset-password' } });
	} catch (e) {
		if (!(e instanceof APIError)) throw e;
	}
}

export async function resetPassword(token: string, newPassword: string) {
	await callAuth(() => auth.api.resetPassword({ body: { token, newPassword } }));
}

export async function changePassword(
	headers: Headers,
	currentPassword: string,
	newPassword: string
) {
	await callAuth(() =>
		auth.api.changePassword({
			headers,
			body: { currentPassword, newPassword, revokeOtherSessions: true }
		})
	);
}
