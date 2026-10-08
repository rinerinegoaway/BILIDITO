import { isAdmin, isVerified } from '#lib/domain/user.ts';
import type { Viewer } from '#lib/components/layout/nav.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const user = locals.user;
	const viewer: Viewer | null = user
		? {
				id: user.id,
				name: user.name,
				username: user.username,
				image: user.image,
				isAdmin: isAdmin(user),
				isVerified: isVerified(user),
				verificationStatus: user.verificationStatus,
				status: user.status
			}
		: null;
	return { viewer };
};
