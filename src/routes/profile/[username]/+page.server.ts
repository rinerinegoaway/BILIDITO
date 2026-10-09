import { error } from '@sveltejs/kit';
import { getOwnAccount, getPublicProfile } from '#lib/server/services/profiles.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const profile = await getPublicProfile(params.username);
	if (!profile) error(404, 'This profile does not exist or is no longer available.');

	const isOwn = locals.user?.id === profile.id;
	// Private contact details are loaded only for the account owner viewing their own profile.
	const account = isOwn ? await getOwnAccount(profile.id) : null;
	return {
		profile,
		isOwn,
		privateDetails: account
			? {
					email: account.email,
					mobileNumber: account.mobileNumber,
					verificationStatus: locals.user!.verificationStatus
				}
			: null
	};
};
