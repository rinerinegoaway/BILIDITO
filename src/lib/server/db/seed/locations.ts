import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { slugify } from '../../../domain/format.ts';
import * as schema from '../schema/index.ts';
import data from './data/cagayan-locations.json' with { type: 'json' };

type Db = PostgresJsDatabase<typeof schema>;
type NewLocation = typeof schema.locations.$inferInsert;

/** Inserts or updates rows by PSGC code and returns their ids. */
async function upsert(db: Db, rows: NewLocation[]): Promise<Map<string, string>> {
	if (rows.length === 0) return new Map();
	const result = await db
		.insert(schema.locations)
		.values(rows)
		.onConflictDoUpdate({
			target: schema.locations.psgcCode,
			set: {
				name: sql`excluded.name`,
				slug: sql`excluded.slug`,
				parentId: sql`excluded.parent_id`,
				isCity: sql`excluded.is_city`,
				lat: sql`excluded.lat`,
				lng: sql`excluded.lng`,
				isServiceArea: sql`excluded.is_service_area`
			}
		})
		.returning({ id: schema.locations.id, psgcCode: schema.locations.psgcCode });
	return new Map(result.map((r) => [r.psgcCode, r.id]));
}

/** Unique slugs among siblings (PSGC names are unique per parent, but slugs could collide). */
function uniqueSlug(name: string, code: string, used: Set<string>): string {
	let slug = slugify(name) || code;
	if (used.has(slug)) slug = `${slug}-${code.slice(-3)}`;
	used.add(slug);
	return slug;
}

/** Seeds Region II → Cagayan → 29 cities/municipalities → 820 barangays. Idempotent. */
export async function seedCagayanLocations(db: Db) {
	const [regionId] = (
		await upsert(db, [
			{
				level: 'REGION',
				name: data.region.name,
				slug: slugify(data.region.name),
				psgcCode: data.region.code,
				isServiceArea: true
			}
		])
	).values();

	const [provinceId] = (
		await upsert(db, [
			{
				parentId: regionId,
				level: 'PROVINCE',
				name: data.province.name,
				slug: slugify(data.province.name),
				psgcCode: data.province.code,
				isServiceArea: true
			}
		])
	).values();

	const lguSlugs = new Set<string>();
	const lguIds = await upsert(
		db,
		data.municipalities.map((m) => ({
			parentId: provinceId,
			level: 'CITY_MUNICIPALITY' as const,
			name: m.name,
			slug: uniqueSlug(m.name, m.code, lguSlugs),
			psgcCode: m.code,
			isCity: m.isCity,
			lat: m.lat ?? null,
			lng: m.lng ?? null,
			isServiceArea: true
		}))
	);

	let barangayCount = 0;
	for (const m of data.municipalities) {
		const parentId = lguIds.get(m.code)!;
		const slugs = new Set<string>();
		// Barangays inherit the municipality centroid until we have better coordinates.
		await upsert(
			db,
			m.barangays.map((b) => ({
				parentId,
				level: 'BARANGAY' as const,
				name: b.name,
				slug: uniqueSlug(b.name, b.code, slugs),
				psgcCode: b.code,
				lat: m.lat ?? null,
				lng: m.lng ?? null,
				isServiceArea: true
			}))
		);
		barangayCount += m.barangays.length;
	}

	return { provinceId, municipalities: lguIds.size, barangays: barangayCount };
}
