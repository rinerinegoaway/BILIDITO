import { fail, redirect } from '@sveltejs/kit';
import { loginSchema } from '#lib/schemas/auth.ts';
import { parseForm } from '#lib/schemas/form.ts';
import { failFromError, ServiceError } from '#lib/server/errors.ts';
import { safeRedirectPath } from '#lib/server/guards.ts';
import { login } from '#lib/server/services/accounts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, safeRedirectPath(url.searchParams.get('redirectTo')));
	return { reset: url.searchParams.get('reset') === '1' };
};

export const actions: Actions = {
	default: async (event) => {
		const parsed = parseForm(loginSchema, await event.request.formData());
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values });

		try {
			await login(parsed.data.identifier, parsed.data.password, event.getClientAddress());
		} catch (e) {
			if (e instanceof ServiceError) {
				return failFromError(e, { identifier: parsed.data.identifier });
			}
			throw e;
		}
		redirect(303, safeRedirectPath(event.url.searchParams.get('redirectTo')));
	}
};
