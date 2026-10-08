import { sql } from 'drizzle-orm';
import { check, index, pgTable, primaryKey, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { listings } from './listings';
import { createdAt, messageKind, tstz } from './_shared';

/** One conversation per (listing, buyer). The seller is denormalised for inbox queries. */
export const conversations = pgTable(
	'conversations',
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
		lastMessageAt: tstz('last_message_at').notNull().defaultNow(),
		buyerLastReadAt: tstz('buyer_last_read_at'),
		sellerLastReadAt: tstz('seller_last_read_at'),
		createdAt: createdAt()
	},
	(t) => [
		check('conversations_distinct_parties', sql`${t.buyerId} <> ${t.sellerId}`),
		uniqueIndex('conversations_listing_buyer_uq').on(t.listingId, t.buyerId),
		index('conversations_buyer_recent_idx').on(t.buyerId, t.lastMessageAt.desc()),
		index('conversations_seller_recent_idx').on(t.sellerId, t.lastMessageAt.desc())
	]
);

export const messages = pgTable(
	'messages',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		conversationId: uuid('conversation_id')
			.notNull()
			.references(() => conversations.id, { onDelete: 'cascade' }),
		/** Null for SYSTEM messages (e.g. "Request to buy sent"). */
		senderId: uuid('sender_id').references(() => users.id),
		kind: messageKind('kind').notNull().default('TEXT'),
		body: text('body').notNull(),
		createdAt: createdAt()
	},
	(t) => [index('messages_conversation_created_idx').on(t.conversationId, t.createdAt)]
);

export const userBlocks = pgTable(
	'user_blocks',
	{
		blockerId: uuid('blocker_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		blockedId: uuid('blocked_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: createdAt()
	},
	(t) => [
		primaryKey({ columns: [t.blockerId, t.blockedId] }),
		index('user_blocks_blocked_idx').on(t.blockedId)
	]
);
