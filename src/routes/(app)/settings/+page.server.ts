import { error, fail } from '@sveltejs/kit';
import { changePasswordSchema } from '#lib/schemas/auth.ts';
import { echoValues, parseForm } from '#lib/schemas/form.ts';
import { failFromError, ServiceError } from '#lib/server/errors.ts';
import { requireActive, requireUser } from '#lib/server/guards.ts';
import { changePassword } from '#lib/server/services/accounts.ts';
import { listBarangays, listServiceMunicipalities } from '#lib/server/services/locations.ts';
import {
	getOwnAccount,
	profileUpdateSchema,
	updateOwnProfile
} from '#lib/server/services/profiles.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);
	const account = await getOwnAccount(user.id);
	if (!account) error(404, 'Not found');
	const municipalities = await listServiceMunicipalities();
	return {
		account,
		provinceName: municipalities[0]?.provinceName ?? 'Cagayan',
		municipalities: municipalities.map(({ id, name }) => ({ id, name })),
		barangays: await listBarangays(account.municipalityId)
	};
};

export const actions: Actions = {
	profile: async (event) => {
		const user = requireActive(event);
		const formData = await event.request.formData();
		const parsed = parseForm(profileUpdateSchema, formData);
		if (!parsed.ok) {
			return fail(400, { section: 'profile', errors: parsed.errors, values: parsed.values });
		}
		try {
			await updateOwnProfile(user, parsed.data);
		} catch (e) {
			if (e instanceof ServiceError) {
				const failure = failFromError(e, echoValues(formData));
				return fail(failure.status, { section: 'profile', ...failure.data });
			}
			throw e;
		}
		return { section: 'profile', saved: true };
	},

	password: async (event) => {
		requireActive(event);
		const parsed = parseForm(changePasswordSchema, await event.request.formData());
		if (!parsed.ok) return fail(400, { section: 'password', errors: parsed.errors });
		try {
			await changePassword(
				event.request.headers,
				parsed.data.currentPassword,
				parsed.data.password
			);
		} catch (e) {
			if (e instanceof ServiceError) {
				const failure = failFromError(e);
				return fail(failure.status, { section: 'password', ...failure.data });
			}
			throw e;
		}
		return { section: 'password', saved: true };
	}
};
