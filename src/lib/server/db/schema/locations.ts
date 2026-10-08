import {
	type AnyPgColumn,
	boolean,
	doublePrecision,
	index,
	pgTable,
	text,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, locationLevel } from './_shared';

/**
 * Hierarchical PH locations (REGION → PROVINCE → CITY_MUNICIPALITY → BARANGAY), keyed by PSGC code.
 * `isServiceArea` gates where BILIDITO operates, so expanding beyond Cagayan is a data change.
 */
export const locations = pgTable(
	'locations',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		parentId: uuid('parent_id').references((): AnyPgColumn => locations.id),
		level: locationLevel('level').notNull(),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		psgcCode: text('psgc_code').notNull(),
		isCity: boolean('is_city').notNull().default(false),
		/** Approximate centroid, used for distance ranking. Never a user's address. */
		lat: doublePrecision('lat'),
		lng: doublePrecision('lng'),
		isServiceArea: boolean('is_service_area').notNull().default(false),
		createdAt: createdAt()
	},
	(t) => [
		uniqueIndex('locations_psgc_code_uq').on(t.psgcCode),
		uniqueIndex('locations_parent_slug_uq').on(t.parentId, t.slug),
		index('locations_level_idx').on(t.level),
		index('locations_parent_idx').on(t.parentId)
	]
);
