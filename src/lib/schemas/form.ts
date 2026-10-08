import type * as z from 'zod';

export type FieldErrors = Partial<Record<string, string>>;

export type ParseResult<T> =
	{ ok: true; data: T } | { ok: false; errors: FieldErrors; values: Record<string, string> };

/** Field names whose values are never echoed back to the browser after a failed submit. */
const SECRET_FIELDS = /password|token/i;

/**
 * Validates FormData against a zod schema. On failure returns the first message per field plus
 * the submitted (non-secret, non-file) values so the form can be re-filled.
 */
export function parseForm<S extends z.ZodType>(
	schema: S,
	formData: FormData
): ParseResult<z.output<S>> {
	const raw: Record<string, FormDataEntryValue> = {};
	for (const [key, value] of formData) raw[key] = value;

	const result = schema.safeParse(raw);
	if (result.success) return { ok: true, data: result.data };

	const errors: FieldErrors = {};
	for (const issue of result.error.issues) {
		const key = issue.path.join('.') || 'form';
		errors[key] ??= issue.message;
	}
	return { ok: false, errors, values: echoValues(formData) };
}

export function echoValues(formData: FormData): Record<string, string> {
	const values: Record<string, string> = {};
	for (const [key, value] of formData) {
		if (typeof value === 'string' && !SECRET_FIELDS.test(key)) values[key] = value;
	}
	return values;
}
