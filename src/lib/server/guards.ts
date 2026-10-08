import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import type { UserRole, UserStatus, VerificationStatus } from '#lib/domain/enums.ts';
import { type AppUser, canTransact, isActive, isAdmin } from '#lib/domain/user.ts';
import type { AuthSession } from '#lib/server/auth.ts';

/** Maps Better Auth's session user (string-typed extra fields) to the app's user type. */
export function toAppUser(u: AuthSession['user']): AppUser {
	return {
		id: u.id,
		name: u.name,
		email: u.email,
		username: u.username ?? '',
		image: u.image ?? null,
		role: u.role as UserRole,
		status: u.status as UserStatus,
		verificationStatus: u.verificationStatus as VerificationStatus,
		municipalityId: u.municipalityId,
		barangayId: u.barangayId
	};
}

/** Only same-site relative paths, so `redirectTo` cannot become an open redirect. */
export function safeRedirectPath(value: string | null | undefined, fallback = '/home'): string {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
		return fallback;
	}
	return value;
}

export function loginRedirect(url: URL): never {
	const target = url.pathname + url.search;
	redirect(303, `/login?redirectTo=${encodeURIComponent(target)}`);
}

export function requireUser(event: Pick<RequestEvent, 'locals' | 'url'>): AppUser {
	const user = event.locals.user;
	if (!user) loginRedirect(event.url);
	return user;
}

export function requireActive(event: Pick<RequestEvent, 'locals' | 'url'>): AppUser {
	const user = requireUser(event);
	if (!isActive(user)) error(403, 'Your account is restricted.');
	return user;
}

/** For pages/actions that need a verified account (posting, buying). Sends others to /verify. */
export function requireVerified(event: Pick<RequestEvent, 'locals' | 'url'>): AppUser {
	const user = requireActive(event);
	if (!canTransact(user)) redirect(303, '/verify');
	return user;
}

export function requireAdmin(event: Pick<RequestEvent, 'locals' | 'url'>): AppUser {
	const user = requireUser(event);
	if (!isAdmin(user)) error(404, 'Not found');
	return user;
}
