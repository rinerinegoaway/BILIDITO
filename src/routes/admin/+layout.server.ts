import { requireAdmin } from '#lib/server/guards.ts';
import type { LayoutServerLoad } from './$types';

// hooks.server.ts already blocks non-admins for every /admin request (including form actions);
// this is a second check for loads.
export const load: LayoutServerLoad = (event) => {
	requireAdmin(event);
	return {};
};
