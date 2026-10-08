import { and, asc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { locations } from '#lib/server/db/schema/index.ts';
import { ServiceError } from '#lib/server/errors.ts';

export interface LocationOption {
	id: string;
	name: string;
}

export interface Municipality extends LocationOption {
	provinceName: string;
	lat: number | null;
	lng: number | null;
}

// Location data changes only when we seed, so cache it for the life of the process.
let municipalitiesCache: Municipality[] | undefined;
const barangayCache = new Map<string, LocationOption[]>();

/** Cities/municipalities where BILIDITO currently operates, sorted by name. */
export async function listServiceMunicipalities(): Promise<Municipality[]> {
	if (municipalitiesCache) return municipalitiesCache;
	const rows = await db
		.select({
			id: locations.id,
			name: locations.name,
			lat: locations.lat,
			lng: locations.lng,
			parentId: locations.parentId
		})
		.from(locations)
		.where(and(eq(locations.level, 'CITY_MUNICIPALITY'), eq(locations.isServiceArea, true)))
		.orderBy(asc(locations.name));

	const parentIds = [...new Set(rows.map((r) => r.parentId).filter((id): id is string => !!id))];
	const provinces = parentIds.length
		? await db
				.select({ id: locations.id, name: locations.name })
				.from(locations)
				.where(eq(locations.level, 'PROVINCE'))
		: [];
	const provinceName = new Map(provinces.map((p) => [p.id, p.name]));

	municipalitiesCache = rows.map((r) => ({
		id: r.id,
		name: r.name,
		lat: r.lat,
		lng: r.lng,
		provinceName: (r.parentId && provinceName.get(r.parentId)) || ''
	}));
	return municipalitiesCache;
}

export async function listBarangays(municipalityId: string): Promise<LocationOption[]> {
	const cached = barangayCache.get(municipalityId);
	if (cached) return cached;
	const rows = await db
		.select({ id: locations.id, name: locations.name })
		.from(locations)
		.where(and(eq(locations.parentId, municipalityId), eq(locations.level, 'BARANGAY')))
		.orderBy(asc(locations.name));
	if (rows.length) barangayCache.set(municipalityId, rows);
	return rows;
}

/**
 * Validates a municipality + barangay pair submitted by a client: the municipality must be in the
 * service area and the barangay must belong to it.
 */
export async function assertValidHomeLocation(municipalityId: string, barangayId: string) {
	const municipality = (await listServiceMunicipalities()).find((m) => m.id === municipalityId);
	if (!municipality) {
		throw new ServiceError('INVALID_LOCATION', 'Please choose a municipality in Cagayan.', 422);
	}
	const barangay = (await listBarangays(municipalityId)).find((b) => b.id === barangayId);
	if (!barangay) {
		throw new ServiceError(
			'INVALID_LOCATION',
			`Please choose a barangay in ${municipality.name}.`,
			422
		);
	}
	return { municipality, barangay };
}

/** "Tuguegarao City, Cagayan": the public location label (never an address). */
export async function municipalityLabel(municipalityId: string): Promise<string> {
	const m = (await listServiceMunicipalities()).find((x) => x.id === municipalityId);
	return m ? `${m.name}, ${m.provinceName}` : '';
}
