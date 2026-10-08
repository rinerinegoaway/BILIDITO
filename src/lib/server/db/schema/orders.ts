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
	smallint,
	text,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { listings } from './listings';
import { locations } from './locations';
import { conversations } from './messaging';
import {
	createdAt,
	fulfilmentMethod,
	orderAction,
	orderCloseReason,
	orderStatus,
	rateeRole,
	tstz,
	updatedAt
} from './_shared';

export const deliveryProviders = pgTable('delivery_providers', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text('description'),
	contact: text('contact'),
	/** Human-readable service area, e.g. "Tuguegarao City and nearby towns". */
	serviceAreaNote: text('service_area_note'),
	/** Estimated base fee range in centavos. Always shown as an estimate. */
	baseFeeMin: bigint('base_fee_min', { mode: 'number' }),
	baseFeeMax: bigint('base_fee_max', { mode: 'number' }),
	isActive: boolean('is_active').notNull().default(true),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

/** Municipalities a provider serves (used to recommend options). */
export const deliveryProviderAreas = pgTable(
	'delivery_provider_areas',
	{
		providerId: uuid('provider_id')
			.notNull()
			.references(() => deliveryProviders.id, { onDelete: 'cascade' }),
		locationId: uuid('location_id')
			.notNull()
			.references(() => locations.id, { onDelete: 'cascade' })
	},
	(t) => [
		primaryKey({ columns: [t.providerId, t.locationId] }),
		index('delivery_provider_areas_location_idx').on(t.locationId)
	]
);

/** "Request to Buy" orders. State machine: docs/TRANSACTION_RULES.md §4. No money is processed. */
export const orders = pgTable(
	'orders',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		listingId: uuid('listing_id')
			.notNull()
			.references(() => listings.id),
		buyerId: uuid('buyer_id')
			.notNull()
			.references(() => users.id),
		sellerId: uuid('seller_id')
			.notNull()
			.references(() => users.id),
		conversationId: uuid('conversation_id').references(() => conversations.id),
		status: orderStatus('status').notNull().default('PENDING'),

		quantity: integer('quantity').notNull().default(1),
		/** Informational snapshot, in centavos. */
		agreedPrice: bigint('agreed_price', { mode: 'number' }).notNull(),
		listingPriceAtRequest: bigint('listing_price_at_request', { mode: 'number' }).notNull(),
		buyerNote: text('buyer_note'),

		preferredMethod: fulfilmentMethod('preferred_method').notNull(),
		method: fulfilmentMethod('method'),
		// Meet-up (visible to participants + admins only)
		meetupPlace: text('meetup_place'),
		meetupLat: doublePrecision('meetup_lat'),
		meetupLng: doublePrecision('meetup_lng'),
		meetupAt: tstz('meetup_at'),
		// Delivery (visible to participants + admins only)
		deliveryProviderId: uuid('delivery_provider_id').references(() => deliveryProviders.id),
		deliveryFeeMin: bigint('delivery_fee_min', { mode: 'number' }),
		deliveryFeeMax: bigint('delivery_fee_max', { mode: 'number' }),
		deliveryAddress: text('delivery_address'),

		acceptedAt: tstz('accepted_at'),
		sellerConfirmedAt: tstz('seller_confirmed_at'),
		buyerConfirmedAt: tstz('buyer_confirmed_at'),
		completedAt: tstz('completed_at'),
		closedAt: tstz('closed_at'),
		closeReason: orderCloseReason('close_reason'),
		closedById: uuid('closed_by_id').references(() => users.id),
		closeNote: text('close_note'),

		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [
		check('orders_distinct_parties', sql`${t.buyerId} <> ${t.sellerId}`),
		check('orders_quantity_pos', sql`${t.quantity} >= 1`),
		check('orders_price_nonneg', sql`${t.agreedPrice} >= 0`),
		uniqueIndex('orders_one_open_per_buyer_listing_uq')
			.on(t.listingId, t.buyerId)
			.where(sql`${t.status} IN ('PENDING','CONFIRMED','FOR_MEETUP','FOR_DELIVERY','DISPUTED')`),
		index('orders_buyer_status_idx').on(t.buyerId, t.status),
		index('orders_seller_status_idx').on(t.sellerId, t.status),
		index('orders_listing_status_idx').on(t.listingId, t.status),
		index('orders_status_updated_idx').on(t.status, t.updatedAt)
	]
);

/** Append-only order timeline; doubles as the admin "action history". */
export const orderEvents = pgTable(
	'order_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		orderId: uuid('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		/** Null when the system acted (expiry, auto-complete). */
		actorId: uuid('actor_id').references(() => users.id),
		action: orderAction('action').notNull(),
		fromStatus: orderStatus('from_status'),
		toStatus: orderStatus('to_status').notNull(),
		note: text('note'),
		createdAt: createdAt()
	},
	(t) => [index('order_events_order_created_idx').on(t.orderId, t.createdAt)]
);

export const ratings = pgTable(
	'ratings',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		orderId: uuid('order_id')
			.notNull()
			.references(() => orders.id),
		raterId: uuid('rater_id')
			.notNull()
			.references(() => users.id),
		rateeId: uuid('ratee_id')
			.notNull()
			.references(() => users.id),
		/** Role of the person being rated in this order. */
		rateeRole: rateeRole('ratee_role').notNull(),
		stars: smallint('stars').notNull(),
		comment: text('comment'),
		createdAt: createdAt()
	},
	(t) => [
		check('ratings_stars_range', sql`${t.stars} BETWEEN 1 AND 5`),
		check('ratings_distinct_parties', sql`${t.raterId} <> ${t.rateeId}`),
		uniqueIndex('ratings_order_rater_uq').on(t.orderId, t.raterId),
		index('ratings_ratee_created_idx').on(t.rateeId, t.createdAt.desc())
	]
);
