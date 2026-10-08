import { error, fail, redirect } from '@sveltejs/kit';
import * as z from 'zod';
import { failFromError, ServiceError } from '#lib/server/errors.ts';
import { requireAdmin } from '#lib/server/guards.ts';
import {
	getSubmissionForReview,
	ID_TYPE_LABELS,
	reviewSubmission
} from '#lib/server/services/verification.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const admin = requireAdmin(event);
	if (!z.uuid().safeParse(event.params.id).success) error(404, 'Not found');
	try {
		const submission = await getSubmissionForReview(admin, event.params.id);
		return { submission, idTypeLabel: ID_TYPE_LABELS[submission.idType] };
	} catch (e) {
		if (e instanceof ServiceError) error(e.status, e.message);
		throw e;
	}
};

const reviewSchema = z.object({
	decision: z.enum(['approve', 'reject']),
	reason: z.string().trim().max(500).optional()
});

export const actions: Actions = {
	default: async (event) => {
		const admin = requireAdmin(event);
		const parsed = reviewSchema.safeParse(Object.fromEntries(await event.request.formData()));
		if (!parsed.success) return fail(400, { message: 'Invalid decision.' });
		try {
			await reviewSubmission(
				admin,
				event.params.id,
				parsed.data.decision,
				parsed.data.reason ?? null
			);
		} catch (e) {
			if (e instanceof ServiceError) return failFromError(e, { reason: parsed.data.reason ?? '' });
			throw e;
		}
		redirect(303, '/admin/verifications');
	}
};
