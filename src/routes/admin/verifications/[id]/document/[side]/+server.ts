import { error } from '@sveltejs/kit';
import * as z from 'zod';
import { ServiceError } from '#lib/server/errors.ts';
import { requireAdmin } from '#lib/server/guards.ts';
import { readDocument } from '#lib/server/services/verification.ts';
import type { RequestHandler } from './$types';

/**
 * Streams a government ID image to an admin (spec §11). There is no public URL for these files;
 * every view is audit-logged and responses are never cached.
 */
export const GET: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const side = z.enum(['front', 'back']).safeParse(event.params.side);
	if (!side.success || !z.uuid().safeParse(event.params.id).success) error(404, 'Not found');

	try {
		const doc = await readDocument(admin, event.params.id, side.data);
		return new Response(doc.data as BodyInit, {
			headers: {
				'content-type': doc.contentType,
				'cache-control': 'private, no-store, max-age=0',
				'x-content-type-options': 'nosniff',
				'content-disposition': 'inline',
				'cross-origin-resource-policy': 'same-origin',
				'x-robots-tag': 'noindex, nofollow'
			}
		});
	} catch (e) {
		if (e instanceof ServiceError) error(e.status, e.message);
		throw e;
	}
};
