import { fail, redirect } from '@sveltejs/kit';
import { registerSchema } from '#lib/schemas/auth.ts';
import { echoValues, parseForm } from '#lib/schemas/form.ts';
import { failFromError, ServiceError } from '#lib/server/errors.ts';
import { register } from '#lib/server/services/accounts.ts';
import { listBarangays, listServiceMunicipalities } from '#lib/server/services/locations.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/home');
	const municipalities = await listServiceMunicipalities();
	return {
		provinceName: municipalities[0]?.provinceName ?? 'Cagayan',
		municipalities: municipalities.map(({ id, name }) => ({ id, name }))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const parsed = parseForm(registerSchema, formData);
		const values = echoValues(formData);
		const barangays = async () =>
			values.municipalityId ? await listBarangays(values.municipalityId).catch(() => []) : [];

		if (!parsed.ok) {
			return fail(400, { errors: parsed.errors, values, barangays: await barangays() });
		}

		try {
			await register(parsed.data, event.getClientAddress());
		} catch (e) {
			if (e instanceof ServiceError) {
				const failure = failFromError(e, values);
				return fail(failure.status, { ...failure.data, barangays: await barangays() });
			}
			throw e;
		}
		// Next step of the spec §10 flow: verify identity.
		redirect(303, '/verify?welcome=1');
	}
};
