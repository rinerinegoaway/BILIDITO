// Single source of truth for enum values. Used by the DB schema (pgEnum), zod schemas and UI.

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const VERIFICATION_STATUSES = ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const ID_TYPES = [
	'NATIONAL_ID',
	'DRIVERS_LICENSE',
	'PASSPORT',
	'UMID',
	'OTHER_GOVERNMENT_ID'
] as const;
export type IdType = (typeof ID_TYPES)[number];

export const LOCATION_LEVELS = ['REGION', 'PROVINCE', 'CITY_MUNICIPALITY', 'BARANGAY'] as const;
export type LocationLevel = (typeof LOCATION_LEVELS)[number];

export const LISTING_STATUSES = ['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'REMOVED'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const ITEM_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'FOR_PARTS'] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const ORDER_STATUSES = [
	'PENDING',
	'CONFIRMED',
	'FOR_MEETUP',
	'FOR_DELIVERY',
	'COMPLETED',
	'CANCELLED',
	'DISPUTED'
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Orders that still hold the buyer/listing pair (see TRANSACTION_RULES §4). */
export const OPEN_ORDER_STATUSES = [
	'PENDING',
	'CONFIRMED',
	'FOR_MEETUP',
	'FOR_DELIVERY',
	'DISPUTED'
] as const satisfies readonly OrderStatus[];

/** Orders whose quantity counts as reserved stock. */
export const RESERVING_ORDER_STATUSES = [
	'CONFIRMED',
	'FOR_MEETUP',
	'FOR_DELIVERY',
	'DISPUTED'
] as const satisfies readonly OrderStatus[];

export const FULFILMENT_METHODS = ['MEETUP', 'DELIVERY'] as const;
export type FulfilmentMethod = (typeof FULFILMENT_METHODS)[number];

export const ORDER_ACTIONS = [
	'REQUEST',
	'ACCEPT',
	'DECLINE',
	'WITHDRAW',
	'EXPIRE',
	'SET_MEETUP',
	'SET_DELIVERY',
	'CANCEL',
	'CONFIRM_HANDOVER',
	'CONFIRM_RECEIVED',
	'AUTO_COMPLETE',
	'DISPUTE',
	'ADMIN_RESOLVE',
	'ADMIN_CANCEL'
] as const;
export type OrderAction = (typeof ORDER_ACTIONS)[number];

export const ORDER_CLOSE_REASONS = [
	'DECLINED',
	'WITHDRAWN',
	'EXPIRED',
	'CANCELLED_BY_BUYER',
	'CANCELLED_BY_SELLER',
	'LISTING_UNAVAILABLE',
	'ACCOUNT_RESTRICTED',
	'ADMIN_ACTION'
] as const;
export type OrderCloseReason = (typeof ORDER_CLOSE_REASONS)[number];

export const RATEE_ROLES = ['BUYER', 'SELLER'] as const;
export type RateeRole = (typeof RATEE_ROLES)[number];

export const MESSAGE_KINDS = ['TEXT', 'SYSTEM'] as const;
export type MessageKind = (typeof MESSAGE_KINDS)[number];

export const REPORT_TARGETS = ['LISTING', 'USER', 'MESSAGE', 'ORDER'] as const;
export type ReportTarget = (typeof REPORT_TARGETS)[number];

export const REPORT_REASONS = [
	'SCAM',
	'FAKE_ITEM',
	'PROHIBITED_ITEM',
	'MISLEADING',
	'DUPLICATE',
	'INAPPROPRIATE',
	'FAKE_ACCOUNT',
	'HARASSMENT',
	'SUSPICIOUS',
	'SPAM',
	'THREATS',
	'DISPUTE',
	'OTHER'
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** Which reasons a reporter may pick for each target (spec §32). Disputes are created by the order flow. */
export const REPORT_REASONS_BY_TARGET = {
	LISTING: [
		'SCAM',
		'FAKE_ITEM',
		'PROHIBITED_ITEM',
		'MISLEADING',
		'DUPLICATE',
		'INAPPROPRIATE',
		'OTHER'
	],
	USER: ['SCAM', 'FAKE_ACCOUNT', 'HARASSMENT', 'SUSPICIOUS', 'OTHER'],
	MESSAGE: ['SCAM', 'HARASSMENT', 'SPAM', 'THREATS', 'OTHER'],
	ORDER: ['DISPUTE']
} as const satisfies Record<ReportTarget, readonly ReportReason[]>;

export const REPORT_STATUSES = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const NOTIFICATION_TYPES = [
	'VERIFICATION_APPROVED',
	'VERIFICATION_REJECTED',
	'NEW_MESSAGE',
	'PURCHASE_REQUEST',
	'REQUEST_ACCEPTED',
	'REQUEST_DECLINED',
	'ORDER_UPDATE',
	'LISTING_SOLD',
	'LISTING_REMOVED',
	'FAVORITE_UPDATE',
	'NEW_REVIEW',
	'REPORT_UPDATE',
	'ACCOUNT_WARNING',
	'ACCOUNT_SUSPENDED',
	'ACCOUNT_BANNED',
	'ACCOUNT_RESTORED',
	'NEARBY_RECOMMENDATION'
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const AUDIT_ACTIONS = [
	'APPROVE_USER',
	'REJECT_USER',
	'VIEW_VERIFICATION_DOCUMENT',
	'WARN_USER',
	'SUSPEND_USER',
	'BAN_USER',
	'RESTORE_USER',
	'REMOVE_LISTING',
	'RESTORE_LISTING',
	'RESOLVE_REPORT',
	'DISMISS_REPORT',
	'RESOLVE_DISPUTE',
	'CANCEL_ORDER',
	'CREATE_CATEGORY',
	'UPDATE_CATEGORY',
	'CREATE_DELIVERY_PROVIDER',
	'UPDATE_DELIVERY_PROVIDER',
	'UPDATE_PROHIBITED_ITEMS',
	'UPDATE_SETTINGS'
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_TARGETS = [
	'USER',
	'VERIFICATION',
	'LISTING',
	'REPORT',
	'ORDER',
	'CATEGORY',
	'DELIVERY_PROVIDER',
	'PROHIBITED_ITEM',
	'SETTINGS'
] as const;
export type AuditTarget = (typeof AUDIT_TARGETS)[number];
