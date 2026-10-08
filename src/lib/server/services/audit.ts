import type { AuditAction, AuditTarget } from '#lib/domain/enums.ts';
import type { DbOrTx } from '#lib/server/db/index.ts';
import { auditLogs } from '#lib/server/db/schema/index.ts';

export interface AuditEntry {
	actorId: string | null;
	action: AuditAction;
	targetType: AuditTarget;
	targetId?: string | null;
	reason?: string | null;
	/** Non-sensitive context only. Never ID numbers, document contents or passwords. */
	metadata?: Record<string, unknown>;
}

/** Appends an audit-log row. Pass the transaction so the log commits with the action itself. */
export async function writeAudit(db: DbOrTx, entry: AuditEntry) {
	await db.insert(auditLogs).values({
		actorId: entry.actorId,
		action: entry.action,
		targetType: entry.targetType,
		targetId: entry.targetId ?? null,
		reason: entry.reason ?? null,
		metadata: entry.metadata ?? null
	});
}
