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
	removeAvatar,
	updateAvatar,
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

/** Runs a section's service call and tags the result/failure with the section name. */
async function section(name: string, fn: () => Promise<unknown>, values?: Record<string, string>) {
	try {
		await fn();
	} catch (e) {
		if (e instanceof ServiceError) {
			const failure = failFromError(e, values);
			return fail(failure.status, { section: name, ...failure.data });
		}
		throw e;
	}
	return { section: name, saved: true };
}

export const actions: Actions = {
	profile: async (event) => {
		const user = requireActive(event);
		const formData = await event.request.formData();
		const parsed = parseForm(profileUpdateSchema, formData);
		if (!parsed.ok) {
			return fail(400, { section: 'profile', errors: parsed.errors, values: parsed.values });
		}
		return section('profile', () => updateOwnProfile(user, parsed.data), echoValues(formData));
	},

	avatar: async (event) => {
		const user = requireActive(event);
		const formData = await event.request.formData();
		return section('avatar', () => updateAvatar(user, formData.get('avatar')));
	},

	removeAvatar: async (event) => {
		const user = requireActive(event);
		return section('avatar', () => removeAvatar(user));
	},

	password: async (event) => {
		requireActive(event);
		const parsed = parseForm(changePasswordSchema, await event.request.formData());
		if (!parsed.ok) return fail(400, { section: 'password', errors: parsed.errors });
		return section('password', () =>
			changePassword(event.request.headers, parsed.data.currentPassword, parsed.data.password)
		);
	}
};
