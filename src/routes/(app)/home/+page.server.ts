import { requireUser } from '#lib/server/guards.ts';
import { municipalityLabel } from '#lib/server/services/locations.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);
	return { location: await municipalityLabel(user.municipalityId) };
};
