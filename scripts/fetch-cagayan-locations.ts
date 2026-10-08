/**
 * One-time data refresh: builds src/lib/server/db/seed/data/cagayan-locations.json from
 *  - PSGC (Philippine Standard Geographic Code) via the psgc.gitlab.io API mirror of PSA data, and
 *  - municipality centroids from OpenStreetMap Nominatim (1 request/second, per its usage policy).
 * The generated file is committed, so seeding never needs the network.
 *
 *   bun scripts/fetch-cagayan-locations.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const PROVINCE_CODE = '021500000';
const OUT = 'src/lib/server/db/seed/data/cagayan-locations.json';
const USER_AGENT = 'BILIDITO-dev-seed/0.1 (one-time municipality centroid lookup)';

interface PsgcPlace {
	code: string;
	name: string;
	isCity?: boolean;
	municipalityCode?: string | false;
	cityCode?: string | false;
}

async function getJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
	const res = await fetch(url, { headers });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
	return (await res.json()) as T;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function geocode(name: string): Promise<{ lat: number; lng: number } | null> {
	const params = new URLSearchParams({
		q: `${name}, Cagayan, Philippines`,
		format: 'jsonv2',
		limit: '1',
		countrycodes: 'ph'
	});
	const results = await getJson<{ lat: string; lon: string }[]>(
		`https://nominatim.openstreetmap.org/search?${params}`,
		{ 'User-Agent': USER_AGENT }
	);
	const hit = results[0];
	return hit
		? { lat: Number(Number(hit.lat).toFixed(5)), lng: Number(Number(hit.lon).toFixed(5)) }
		: null;
}

const base = 'https://psgc.gitlab.io/api';
const province = await getJson<PsgcPlace & { regionCode: string }>(
	`${base}/provinces/${PROVINCE_CODE}/`
);
const region = await getJson<PsgcPlace & { regionName?: string }>(
	`${base}/regions/${province.regionCode}/`
);
const lgus = await getJson<PsgcPlace[]>(
	`${base}/provinces/${PROVINCE_CODE}/cities-municipalities/`
);
const barangays = await getJson<PsgcPlace[]>(`${base}/provinces/${PROVINCE_CODE}/barangays/`);

const municipalities = [];
for (const lgu of lgus.sort((a, b) => a.name.localeCompare(b.name))) {
	const point = await geocode(lgu.name.replace(/^City of /, '') + (lgu.isCity ? ' City' : ''));
	await sleep(1100);
	console.log(`${lgu.name}: ${point ? `${point.lat}, ${point.lng}` : 'NOT FOUND'}`);
	municipalities.push({
		code: lgu.code,
		name: lgu.name,
		isCity: Boolean(lgu.isCity),
		...point,
		barangays: barangays
			.filter((b) => (b.municipalityCode || b.cityCode) === lgu.code)
			.map((b) => ({ code: b.code, name: b.name }))
			.sort((a, b) => a.name.localeCompare(b.name))
	});
}

const data = {
	source:
		'PSGC (Philippine Statistics Authority) via psgc.gitlab.io; centroids © OpenStreetMap contributors (ODbL) via Nominatim',
	fetchedAt: new Date().toISOString(),
	region: { code: region.code, name: region.regionName ?? region.name },
	province: { code: province.code, name: province.name },
	municipalities
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data, null, '\t') + '\n');
const total = municipalities.reduce((n, m) => n + m.barangays.length, 0);
console.log(`Wrote ${OUT}: ${municipalities.length} cities/municipalities, ${total} barangays`);
