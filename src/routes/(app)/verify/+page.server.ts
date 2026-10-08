import { fail, redirect } from '@sveltejs/kit';
import * as z from 'zod';
import { ID_TYPES } from '#lib/domain/enums.ts';
import { failFromError, ServiceError } from '#lib/server/errors.ts';
import { requireActive, requireUser } from '#lib/server/guards.ts';
import {
	getLatestSubmission,
	ID_TYPE_LABELS,
	submitVerification
} from '#lib/server/services/verification.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);
	return {
		welcome: event.url.searchParams.get('welcome') === '1',
		status: user.verificationStatus,
		latest: await getLatestSubmission(user.id),
		idTypes: ID_TYPES.map((value) => ({ value, label: ID_TYPE_LABELS[value] }))
	};
};

const idTypeSchema = z.enum(ID_TYPES, 'Choose the type of ID.');

export const actions: Actions = {
	default: async (event) => {
		const user = requireActive(event);
		const formData = await event.request.formData();
		const idType = idTypeSchema.safeParse(formData.get('idType'));
		if (!idType.success) {
			return fail(400, { errors: { idType: idType.error.issues[0].message } });
		}
		try {
			await submitVerification(user, {
				idType: idType.data,
				front: formData.get('front'),
				back: formData.get('back')
			});
		} catch (e) {
			if (e instanceof ServiceError) return failFromError(e, { idType: idType.data });
			throw e;
		}
		redirect(303, '/verify?submitted=1');
	}
};
