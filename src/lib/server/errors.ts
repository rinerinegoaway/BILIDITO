import { fail } from '@sveltejs/kit';
import type { FieldErrors } from '#lib/schemas/form.ts';

type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 429;

/**
 * A rule violation raised by a service (not a bug). Form actions turn it into `fail(status)` and
 * a future JSON API can turn it into an error response with the same status and code.
 * `field` attaches the message to a form field instead of the form as a whole.
 */
export class ServiceError extends Error {
	constructor(
		readonly code: string,
		message: string,
		readonly status: ErrorStatus = 400,
		readonly field?: string
	) {
		super(message);
		this.name = 'ServiceError';
	}
}

export const notFound = (what = 'Item') => new ServiceError('NOT_FOUND', `${what} not found.`, 404);
export const forbidden = (message = 'You are not allowed to do that.') =>
	new ServiceError('FORBIDDEN', message, 403);

/** Shape returned to forms on failure. */
export interface FormFailure {
	message?: string;
	errors?: FieldErrors;
	values?: Record<string, string>;
}

/** Converts a ServiceError into an ActionFailure, keeping submitted values for re-filling. */
export function failFromError(e: ServiceError, values?: Record<string, string>) {
	const body: FormFailure = e.field
		? { errors: { [e.field]: e.message }, values }
		: { message: e.message, values };
	return fail(e.status, body);
}

/** Runs a service call inside a form action, mapping ServiceError to an ActionFailure. */
export async function runAction<T>(fn: () => Promise<T>, values?: Record<string, string>) {
	try {
		return await fn();
	} catch (e) {
		if (e instanceof ServiceError) return failFromError(e, values);
		throw e;
	}
}
