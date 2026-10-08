import { count, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { users, userVerifications } from '#lib/server/db/schema/index.ts';
import { requireAdmin } from '#lib/server/guards.ts';
import type { PageServerLoad } from './$types';

// Minimal dashboard for Phase 2; the full metrics and charts (spec §37) arrive in Phase 7.
export const load: PageServerLoad = async (event) => {
	requireAdmin(event);
	const [[totalUsers], [verifiedUsers], [pending]] = await Promise.all([
		db.select({ n: count() }).from(users),
		db.select({ n: count() }).from(users).where(eq(users.verificationStatus, 'VERIFIED')),
		db.select({ n: count() }).from(userVerifications).where(eq(userVerifications.status, 'PENDING'))
	]);
	return {
		stats: [
			{ label: 'Total users', value: totalUsers.n },
			{ label: 'Verified users', value: verifiedUsers.n },
			{ label: 'Pending verification', value: pending.n, href: '/admin/verifications' }
		]
	};
};
