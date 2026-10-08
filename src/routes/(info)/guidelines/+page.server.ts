import { asc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { prohibitedItems } from '#lib/server/db/schema/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	// Admin-managed (spec §35).
	prohibited: await db
		.select({ name: prohibitedItems.name, description: prohibitedItems.description })
		.from(prohibitedItems)
		.where(eq(prohibitedItems.isActive, true))
		.orderBy(asc(prohibitedItems.sortOrder), asc(prohibitedItems.name))
});
