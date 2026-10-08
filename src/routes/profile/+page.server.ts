import { redirect } from '@sveltejs/kit';
import { requireUser } from '#lib/server/guards.ts';
import type { PageServerLoad } from './$types';

/** `/profile` is the signed-in user's own public profile. */
export const load: PageServerLoad = (event) => {
	const user = requireUser(event);
	redirect(303, `/profile/${user.username}`);
};
