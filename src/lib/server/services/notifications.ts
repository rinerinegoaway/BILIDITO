import { and, count, eq, isNull } from 'drizzle-orm';
import type { NotificationType } from '#lib/domain/enums.ts';
import { db, type DbOrTx } from '#lib/server/db/index.ts';
import { notifications } from '#lib/server/db/schema/index.ts';

export interface NewNotification {
	userId: string;
	type: NotificationType;
	title: string;
	body: string;
	href?: string;
	refType?: string;
	refId?: string;
}

/** Creates an in-app notification (spec §36). Pass the transaction to commit with the action. */
export async function notify(tx: DbOrTx, n: NewNotification) {
	await tx.insert(notifications).values({
		userId: n.userId,
		type: n.type,
		title: n.title,
		body: n.body,
		href: n.href ?? null,
		refType: n.refType ?? null,
		refId: n.refId ?? null
	});
}

export async function unreadCount(userId: string): Promise<number> {
	const [row] = await db
		.select({ n: count() })
		.from(notifications)
		.where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
	return row?.n ?? 0;
}
