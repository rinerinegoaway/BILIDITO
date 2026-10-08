import { count } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../schema/index.ts';

type Db = PostgresJsDatabase<typeof schema>;

/** Starting list from spec §35. Admins manage it afterwards, so this only runs on an empty table. */
const PROHIBITED_ITEMS = [
	{
		name: 'Illegal drugs',
		description: 'Prohibited and regulated drugs, drug paraphernalia, and prescription medicines.',
		keywords: ['shabu', 'marijuana', 'weed', 'cannabis', 'kush', 'ecstasy', 'cocaine']
	},
	{
		name: 'Weapons',
		description: 'Firearms, ammunition, explosives and parts, and other deadly weapons.',
		keywords: ['firearm', 'pistol', 'rifle', 'ammo', 'ammunition', 'bala', 'baril', 'explosive']
	},
	{
		name: 'Stolen property',
		description: 'Anything you do not legally own or cannot prove ownership of.',
		keywords: ['nakaw', 'stolen']
	},
	{
		name: 'Counterfeit goods',
		description: 'Fakes, replicas or "class A" copies of branded products.',
		keywords: ['replica', 'class a', 'fake', 'copy original', 'oem copy']
	},
	{
		name: 'Illegal services',
		description: 'Services that are against the law, including fake documents and gambling.',
		keywords: ['fake id', 'fake diploma', 'sabong online', 'e-sabong']
	},
	{
		name: 'Other prohibited goods',
		description:
			'Wildlife and endangered species, adult content, government-issued IDs and documents, and personal data.',
		keywords: ['pangolin', 'wildlife', 'id for sale']
	}
];

export async function seedProhibitedItems(db: Db) {
	const [{ n }] = await db.select({ n: count() }).from(schema.prohibitedItems);
	if (n > 0) return 0;
	await db
		.insert(schema.prohibitedItems)
		.values(PROHIBITED_ITEMS.map((item, i) => ({ ...item, sortOrder: i })));
	return PROHIBITED_ITEMS.length;
}
