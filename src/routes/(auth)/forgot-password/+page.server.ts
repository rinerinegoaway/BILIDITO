import { fail } from '@sveltejs/kit';
import { forgotPasswordSchema } from '#lib/schemas/auth.ts';
import { parseForm } from '#lib/schemas/form.ts';
import { failFromError, ServiceError } from '#lib/server/errors.ts';
import { requestPasswordReset } from '#lib/server/services/accounts.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const parsed = parseForm(forgotPasswordSchema, await event.request.formData());
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values });
		try {
			await requestPasswordReset(parsed.data.email, event.getClientAddress());
		} catch (e) {
			if (e instanceof ServiceError) return failFromError(e, { email: parsed.data.email });
			throw e;
		}
		// Same response whether or not the email exists (no account enumeration).
		return { sent: true, email: parsed.data.email };
	}
};
