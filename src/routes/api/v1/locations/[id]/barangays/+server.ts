import { error, json } from '@sveltejs/kit';
import * as z from 'zod';
import { listBarangays } from '#lib/server/services/locations.ts';
import type { RequestHandler } from './$types';

/** Public, cacheable list of barangays for a municipality (used by LocationSelector). */
export const GET: RequestHandler = async ({ params, setHeaders }) => {
	if (!z.uuid().safeParse(params.id).success) error(404, 'Not found');
	const barangays = await listBarangays(params.id);
	if (barangays.length === 0) error(404, 'Not found');
	setHeaders({ 'cache-control': 'public, max-age=86400' });
	return json(barangays);
};
