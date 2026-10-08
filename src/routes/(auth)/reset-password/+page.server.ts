import { fail, redirect } from '@sveltejs/kit';
import { resetPasswordSchema } from '#lib/schemas/auth.ts';
import { parseForm } from '#lib/schemas/form.ts';
import { failFromError, ServiceError } from '#lib/server/errors.ts';
import { resetPassword } from '#lib/server/services/accounts.ts';
import type { Actions, PageServerLoad } from './$types';

// Better Auth validates the emailed link at /api/auth/reset-password/:token and then redirects here
// with ?token=… (or ?error=INVALID_TOKEN).
export const load: PageServerLoad = ({ url }) => ({
	token: url.searchParams.get('token') ?? '',
	invalid: url.searchParams.get('error') === 'INVALID_TOKEN' || !url.searchParams.get('token')
});

export const actions: Actions = {
	default: async ({ request }) => {
		const parsed = parseForm(resetPasswordSchema, await request.formData());
		if (!parsed.ok) return fail(400, { errors: parsed.errors });
		try {
			await resetPassword(parsed.data.token, parsed.data.password);
		} catch (e) {
			if (e instanceof ServiceError) return failFromError(e);
			throw e;
		}
		redirect(303, '/login?reset=1');
	}
};
