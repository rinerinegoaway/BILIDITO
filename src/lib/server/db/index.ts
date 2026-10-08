import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '$app/env/private';
import * as schema from './schema/index.ts';

const client = postgres(DATABASE_URL, { max: 10, onnotice: () => {} });

export const db = drizzle(client, { schema });

export type Db = typeof db;
/** A Drizzle transaction handle, for services that must run inside a caller's transaction. */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
export type DbOrTx = Db | Tx;
