import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { listings } from './listings';
import { messages } from './messaging';
import { orders } from './orders';
import {
	auditAction,
	auditTarget,
	createdAt,
	idType,
	notificationType,
	reportReason,
	reportStatus,
	reportTarget,
	tstz,
	updatedAt,
	verificationStatus
} from './_shared';

/**
 * Government ID submissions. Image keys point to the PRIVATE bucket and are only ever streamed
 * through the admin document endpoint (spec §11). No ID number is collected.
 */
export const userVerifications = pgTable(
	'user_verifications',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		idType: idType('id_type').notNull(),
		frontImageKey: text('front_image_key'),
		backImageKey: text('back_image_key'),
		/** PENDING → VERIFIED | REJECTED. */
		status: verificationStatus('status').notNull().default('PENDING'),
		rejectionReason: text('rejection_reason'),
		reviewedById: uuid('reviewed_by_id').references(() => users.id),
		reviewedAt: tstz('reviewed_at'),
		/** Set when image objects are deleted under the retention policy; keys are nulled. */
		documentsPurgedAt: tstz('documents_purged_at'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [
		index('user_verifications_status_created_idx').on(t.status, t.createdAt),
		index('user_verifications_user_idx').on(t.userId),
		uniqueIndex('user_verifications_one_pending_uq')
			.on(t.userId)
			.where(sql`${t.status} = 'PENDING'`)
	]
);

export const reports = pgTable(
	'reports',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		reporterId: uuid('reporter_id')
			.notNull()
			.references(() => users.id),
		targetType: reportTarget('target_type').notNull(),
		listingId: uuid('listing_id').references(() => listings.id),
		reportedUserId: uuid('reported_user_id').references(() => users.id),
		messageId: uuid('message_id').references(() => messages.id),
		orderId: uuid('order_id').references(() => orders.id),
		reason: reportReason('reason').notNull(),
		description: text('description'),
		status: reportStatus('status').notNull().default('OPEN'),
		assignedAdminId: uuid('assigned_admin_id').references(() => users.id),
		resolutionNote: text('resolution_note'),
		resolvedById: uuid('resolved_by_id').references(() => users.id),
		resolvedAt: tstz('resolved_at'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [
		index('reports_status_created_idx').on(t.status, t.createdAt),
		index('reports_reported_user_idx').on(t.reportedUserId),
		index('reports_listing_idx').on(t.listingId),
		index('reports_order_idx').on(t.orderId)
	]
);

export const notifications = pgTable(
	'notifications',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: notificationType('type').notNull(),
		title: text('title').notNull(),
		body: text('body').notNull(),
		/** In-app path to open, e.g. `/orders/<id>`. */
		href: text('href'),
		refType: text('ref_type'),
		refId: uuid('ref_id'),
		readAt: tstz('read_at'),
		createdAt: createdAt()
	},
	(t) => [
		index('notifications_user_created_idx').on(t.userId, t.createdAt.desc()),
		index('notifications_user_unread_idx')
			.on(t.userId)
			.where(sql`${t.readAt} IS NULL`)
	]
);

/** Append-only record of admin (and system moderation) actions. Never put ID data in `metadata`. */
export const auditLogs = pgTable(
	'audit_logs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		actorId: uuid('actor_id').references(() => users.id),
		action: auditAction('action').notNull(),
		targetType: auditTarget('target_type').notNull(),
		targetId: uuid('target_id'),
		reason: text('reason'),
		metadata: jsonb('metadata').$type<Record<string, unknown>>(),
		createdAt: createdAt()
	},
	(t) => [
		index('audit_logs_target_idx').on(t.targetType, t.targetId),
		index('audit_logs_actor_created_idx').on(t.actorId, t.createdAt.desc()),
		index('audit_logs_action_created_idx').on(t.action, t.createdAt.desc())
	]
);
