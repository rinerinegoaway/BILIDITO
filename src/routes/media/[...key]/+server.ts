import { error } from '@sveltejs/kit';
import { assertSafeKey, publicStore } from '#lib/server/storage.ts';
import type { RequestHandler } from './$types';

// Only public-bucket folders. Government IDs live in the separate private bucket and are never
// reachable from here.
const PUBLIC_PREFIXES = ['avatars/', 'listings/'];

/**
 * Serves public images (profile photos, listing photos) from the local storage driver.
 * Keys contain a random UUID and are never overwritten, so responses can be cached forever.
 * In production a CDN in front of object storage replaces this route.
 */
export const GET: RequestHandler = async ({ params }) => {
	const key = params.key;
	try {
		assertSafeKey(key);
	} catch {
		error(404, 'Not found');
	}
	if (!PUBLIC_PREFIXES.some((p) => key.startsWith(p))) error(404, 'Not found');

	const object = await publicStore.get(key);
	if (!object) error(404, 'Not found');
	return new Response(object.data as BodyInit, {
		headers: {
			'content-type': object.contentType,
			'cache-control': 'public, max-age=31536000, immutable',
			'x-content-type-options': 'nosniff'
		}
	});
};
