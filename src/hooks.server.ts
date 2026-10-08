import { error } from '@sveltejs/kit';
import { type Handle, sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { isAdmin } from '#lib/domain/user.ts';
import { auth } from '#lib/server/auth.ts';
import { loginRedirect, toAppUser } from '#lib/server/guards.ts';

/** Loads the Better Auth session and exposes the app user on `locals`. */
const handleSession: Handle = async ({ event, resolve }) => {
	if (!building) {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (session) {
			event.locals.session = session.session;
			event.locals.user = toAppUser(session.user);
		}
	}
	return svelteKitHandler({ event, resolve, auth, building });
};

/**
 * Admin area guard by path. Layout `load` functions do not protect form actions, so this runs for
 * every request under /admin, and admin services check `requireAdmin` again.
 */
const guardAdmin: Handle = ({ event, resolve }) => {
	if (event.url.pathname === '/admin' || event.url.pathname.startsWith('/admin/')) {
		if (!event.locals.user) loginRedirect(event.url);
		// 404 rather than 403, so the admin area's existence is not confirmed to non-admins.
		if (!isAdmin(event.locals.user)) error(404, 'Not found');
	}
	return resolve(event);
};

const MUTATION_ALLOWED_WHEN_RESTRICTED = ['/logout', '/api/auth/sign-out'];

/** Suspended and banned users can still sign in and read, but cannot change anything. */
const restrictMutations: Handle = ({ event, resolve }) => {
	const user = event.locals.user;
	const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(event.request.method);
	if (
		user &&
		user.status !== 'ACTIVE' &&
		isMutation &&
		!MUTATION_ALLOWED_WHEN_RESTRICTED.includes(event.url.pathname)
	) {
		error(403, 'Your account is restricted. You can view BILIDITO but cannot make changes.');
	}
	return resolve(event);
};

/** Pages under (app) require a session; public pages and auth pages do not. */
const requireLoginForApp: Handle = ({ event, resolve }) => {
	if (event.route.id?.startsWith('/(app)') && !event.locals.user) {
		loginRedirect(event.url);
	}
	return resolve(event);
};

export const handle: Handle = sequence(
	handleSession,
	guardAdmin,
	requireLoginForApp,
	restrictMutations
);
