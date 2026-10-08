import { customType, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import {
	AUDIT_ACTIONS,
	AUDIT_TARGETS,
	FULFILMENT_METHODS,
	ID_TYPES,
	ITEM_CONDITIONS,
	LISTING_STATUSES,
	LOCATION_LEVELS,
	MESSAGE_KINDS,
	NOTIFICATION_TYPES,
	ORDER_ACTIONS,
	ORDER_CLOSE_REASONS,
	ORDER_STATUSES,
	RATEE_ROLES,
	REPORT_REASONS,
	REPORT_STATUSES,
	REPORT_TARGETS,
	USER_ROLES,
	USER_STATUSES,
	VERIFICATION_STATUSES
} from '../../../domain/enums';

export const userRole = pgEnum('user_role', USER_ROLES);
export const userStatus = pgEnum('user_status', USER_STATUSES);
export const verificationStatus = pgEnum('verification_status', VERIFICATION_STATUSES);
export const idType = pgEnum('id_type', ID_TYPES);
export const locationLevel = pgEnum('location_level', LOCATION_LEVELS);
export const listingStatus = pgEnum('listing_status', LISTING_STATUSES);
export const itemCondition = pgEnum('item_condition', ITEM_CONDITIONS);
export const orderStatus = pgEnum('order_status', ORDER_STATUSES);
export const fulfilmentMethod = pgEnum('fulfilment_method', FULFILMENT_METHODS);
export const orderAction = pgEnum('order_action', ORDER_ACTIONS);
export const orderCloseReason = pgEnum('order_close_reason', ORDER_CLOSE_REASONS);
export const rateeRole = pgEnum('ratee_role', RATEE_ROLES);
export const messageKind = pgEnum('message_kind', MESSAGE_KINDS);
export const reportTarget = pgEnum('report_target', REPORT_TARGETS);
export const reportReason = pgEnum('report_reason', REPORT_REASONS);
export const reportStatus = pgEnum('report_status', REPORT_STATUSES);
export const notificationType = pgEnum('notification_type', NOTIFICATION_TYPES);
export const auditAction = pgEnum('audit_action', AUDIT_ACTIONS);
export const auditTarget = pgEnum('audit_target', AUDIT_TARGETS);

export const tsvector = customType<{ data: string }>({
	dataType() {
		return 'tsvector';
	}
});

export const createdAt = () =>
	timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const updatedAt = () =>
	timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date());

export const tstz = (name: string) => timestamp(name, { withTimezone: true });
