import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { STORAGE_DIR } from '$app/env/private';

/**
 * Object storage. Two buckets:
 *  - `public`: listing photos and avatars (served to everyone, CDN-friendly);
 *  - `private`: government ID images. Never served directly: only the admin document endpoint
 *    streams them, after a role check and an audit-log entry (spec §11).
 *
 * The local-disk driver is used for development and single-server deployments. An S3-compatible
 * driver (Supabase Storage / Cloudflare R2) implementing the same interface is added before
 * deploying to a multi-instance host.
 */
export interface ObjectStore {
	put(key: string, data: Uint8Array, contentType: string): Promise<void>;
	get(key: string): Promise<{ data: Uint8Array; contentType: string } | null>;
	delete(key: string): Promise<void>;
}

const CONTENT_TYPES: Record<string, string> = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp'
};

/** Keys are app-generated, but reject anything that could escape the bucket folder anyway. */
export function assertSafeKey(key: string) {
	if (!/^[a-z0-9][a-z0-9/_.-]*$/i.test(key) || key.includes('..') || key.includes('//')) {
		throw new Error('Invalid storage key');
	}
}

class LocalDiskStore implements ObjectStore {
	private readonly root: string;

	constructor(root: string) {
		this.root = resolve(root);
	}

	private path(key: string) {
		assertSafeKey(key);
		const full = resolve(join(this.root, key));
		if (!full.startsWith(this.root + sep)) throw new Error('Invalid storage key');
		return full;
	}

	async put(key: string, data: Uint8Array) {
		const file = this.path(key);
		await mkdir(dirname(file), { recursive: true });
		await writeFile(file, data);
	}

	async get(key: string) {
		try {
			const data = await readFile(this.path(key));
			const ext = key.split('.').pop()?.toLowerCase() ?? '';
			return { data, contentType: CONTENT_TYPES[ext] ?? 'application/octet-stream' };
		} catch (e) {
			if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
			throw e;
		}
	}

	async delete(key: string) {
		await rm(this.path(key), { force: true });
	}
}

export const privateStore: ObjectStore = new LocalDiskStore(join(STORAGE_DIR, 'private'));
export const publicStore: ObjectStore = new LocalDiskStore(join(STORAGE_DIR, 'public'));
