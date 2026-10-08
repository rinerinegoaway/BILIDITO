import { redirect } from '@sveltejs/kit';
import { auth } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

// Logging out is a POST (CSRF-protected form action); GET just returns home.
export const load: PageServerLoad = () => redirect(303, '/');

export const actions: Actions = {
	default: async ({ request }) => {
		await auth.api.signOut({ headers: request.headers });
		redirect(303, '/');
	}
};
