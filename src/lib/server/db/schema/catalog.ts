import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	pgTable,
	text,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './_shared';

export const categories = pgTable(
	'categories',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		parentId: uuid('parent_id').references((): AnyPgColumn => categories.id),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		description: text('description'),
		/** Icon key rendered by the UI icon set. */
		icon: text('icon'),
		sortOrder: integer('sort_order').notNull().default(0),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [
		uniqueIndex('categories_slug_uq').on(t.slug),
		index('categories_parent_sort_idx').on(t.parentId, t.sortOrder)
	]
);

/**
 * Admin-managed list of prohibited goods (spec §35). Shown in the community guidelines; `keywords`
 * flag matching listings for moderator review.
 */
export const prohibitedItems = pgTable('prohibited_items', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text('description'),
	keywords: text('keywords').array().notNull().default([]),
	isActive: boolean('is_active').notNull().default(true),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});
