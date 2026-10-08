import { error } from '@sveltejs/kit';
import { getPublicProfile } from '#lib/server/services/profiles.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const profile = await getPublicProfile(params.username);
	if (!profile) error(404, 'This profile does not exist or is no longer available.');
	return { profile, isOwn: locals.user?.id === profile.id };
};
