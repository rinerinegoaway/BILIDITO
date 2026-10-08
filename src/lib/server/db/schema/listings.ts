import { sql } from 'drizzle-orm';
import {
	bigint,
	boolean,
	check,
	doublePrecision,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	uuid
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { categories } from './catalog';
import { locations } from './locations';
import { createdAt, itemCondition, listingStatus, tstz, tsvector, updatedAt } from './_shared';

export const listings = pgTable(
	'listings',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		sellerId: uuid('seller_id')
			.notNull()
			.references(() => users.id),
		categoryId: uuid('category_id')
			.notNull()
			.references(() => categories.id),
		title: text('title').notNull(),
		description: text('description').notNull(),
		/** PHP centavos. */
		price: bigint('price', { mode: 'number' }).notNull(),
		isNegotiable: boolean('is_negotiable').notNull().default(false),
		condition: itemCondition('condition').notNull(),
		brand: text('brand'),
		model: text('model'),
		status: listingStatus('status').notNull().default('DRAFT'),
		/** True when the seller put the listing on hold manually (TRANSACTION_RULES §3). */
		isManuallyReserved: boolean('is_manually_reserved').notNull().default(false),

		quantity: integer('quantity').notNull().default(1),
		/** Maintained by the order service under row lock. */
		quantityReserved: integer('quantity_reserved').notNull().default(0),
		quantitySold: integer('quantity_sold').notNull().default(0),

		municipalityId: uuid('municipality_id')
			.notNull()
			.references(() => locations.id),
		barangayId: uuid('barangay_id')
			.notNull()
			.references(() => locations.id),
		/** Approximate point (rounded on write), never an exact address. */
		lat: doublePrecision('lat'),
		lng: doublePrecision('lng'),

		viewCount: integer('view_count').notNull().default(0),
		/** Set when a prohibited-item keyword matched; surfaces in admin listings. */
		flaggedReason: text('flagged_reason'),

		publishedAt: tstz('published_at'),
		soldAt: tstz('sold_at'),
		removedAt: tstz('removed_at'),
		removedById: uuid('removed_by_id').references(() => users.id),
		removalReason: text('removal_reason'),

		searchVector: tsvector('search_vector').generatedAlwaysAs(
			sql`setweight(to_tsvector('simple', coalesce(title, '')), 'A') || setweight(to_tsvector('simple', coalesce(brand, '') || ' ' || coalesce(model, '')), 'B') || setweight(to_tsvector('simple', coalesce(description, '')), 'C')`
		),

		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [
		check('listings_price_nonneg', sql`${t.price} >= 0`),
		check('listings_quantity_pos', sql`${t.quantity} >= 1`),
		check(
			'listings_stock_valid',
			sql`${t.quantityReserved} >= 0 AND ${t.quantitySold} >= 0 AND ${t.quantityReserved} + ${t.quantitySold} <= ${t.quantity}`
		),
		index('listings_status_published_idx').on(t.status, t.publishedAt.desc()),
		index('listings_seller_status_idx').on(t.sellerId, t.status),
		index('listings_category_status_idx').on(t.categoryId, t.status),
		index('listings_municipality_status_idx').on(t.municipalityId, t.status),
		index('listings_price_idx').on(t.price),
		index('listings_lat_lng_idx').on(t.lat, t.lng),
		index('listings_search_idx').using('gin', t.searchVector),
		index('listings_title_trgm_idx').using('gin', sql`${t.title} gin_trgm_ops`)
	]
);

export const listingImages = pgTable(
	'listing_images',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		listingId: uuid('listing_id')
			.notNull()
			.references(() => listings.id, { onDelete: 'cascade' }),
		/** Object keys in the public bucket. Position 0 is the primary image. */
		storageKey: text('storage_key').notNull(),
		thumbKey: text('thumb_key').notNull(),
		width: integer('width').notNull(),
		height: integer('height').notNull(),
		position: integer('position').notNull().default(0),
		createdAt: createdAt()
	},
	(t) => [index('listing_images_listing_pos_idx').on(t.listingId, t.position)]
);

export const favorites = pgTable(
	'favorites',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		listingId: uuid('listing_id')
			.notNull()
			.references(() => listings.id, { onDelete: 'cascade' }),
		createdAt: createdAt()
	},
	(t) => [
		primaryKey({ columns: [t.userId, t.listingId] }),
		index('favorites_listing_idx').on(t.listingId)
	]
);
