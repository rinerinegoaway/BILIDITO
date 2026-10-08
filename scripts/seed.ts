/**
 * Seeds reference data (Cagayan locations). With --dev-users it also creates local test accounts
 * and writes their passwords to dev-accounts.local.md (gitignored).
 *
 *   bun run db:seed              # locations only (safe for any environment)
 *   bun run db:seed --dev-users  # + test accounts (local development only)
 */
import { writeFileSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema/index.ts';
import { seedProhibitedItems } from '../src/lib/server/db/seed/catalog.ts';
import { seedDevUsers } from '../src/lib/server/db/seed/dev-users.ts';
import { seedCagayanLocations } from '../src/lib/server/db/seed/locations.ts';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const client = postgres(url, { max: 1, onnotice: () => {} });
const db = drizzle(client, { schema });

try {
	const locations = await seedCagayanLocations(db);
	console.log(
		`Locations: Cagayan with ${locations.municipalities} cities/municipalities and ${locations.barangays} barangays`
	);
	const prohibited = await seedProhibitedItems(db);
	console.log(
		prohibited ? `Prohibited items: ${prohibited} added` : 'Prohibited items: kept existing'
	);

	if (process.argv.includes('--dev-users')) {
		const host = new URL(url).hostname;
		if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
			throw new Error(`Refusing to create test accounts on non-local database host "${host}"`);
		}
		const users = await seedDevUsers(db);
		const rows = users
			.map((u) => `| ${u.purpose} | \`${u.username}\` or \`${u.email}\` | \`${u.password}\` |`)
			.join('\n');
		writeFileSync(
			'dev-accounts.local.md',
			`# Local test accounts (gitignored, development only)\n\n` +
				`Log in at http://localhost:5173/login with the username **or** email.\n` +
				`Re-running \`bun run db:seed --dev-users\` generates new passwords.\n\n` +
				`| Account | Login | Password |\n|---|---|---|\n${rows}\n`
		);
		console.log(
			`Test accounts: ${users.map((u) => u.username).join(', ')} → dev-accounts.local.md`
		);
	}
} finally {
	await client.end();
}
