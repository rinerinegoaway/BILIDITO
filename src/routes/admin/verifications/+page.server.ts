import * as z from 'zod';
import { requireAdmin } from '#lib/server/guards.ts';
import { ID_TYPE_LABELS, listSubmissions } from '#lib/server/services/verification.ts';
import type { PageServerLoad } from './$types';

const statusSchema = z.enum(['PENDING', 'VERIFIED', 'REJECTED']).catch('PENDING');

export const load: PageServerLoad = async (event) => {
	const admin = requireAdmin(event);
	const status = statusSchema.parse(event.url.searchParams.get('status'));
	const rows = await listSubmissions(admin, status);
	return {
		status,
		rows: rows.map((r) => ({ ...r, idTypeLabel: ID_TYPE_LABELS[r.idType] }))
	};
};
