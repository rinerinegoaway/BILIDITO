import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { normaliseDocumentPhoto, sniffImageType } from './images.ts';

const make = (format: 'jpeg' | 'png' | 'webp') =>
	sharp({ create: { width: 8, height: 8, channels: 3, background: '#0B3D91' } })
		[format]()
		.toBuffer();

describe('sniffImageType', () => {
	it('recognises JPEG, PNG and WebP by magic bytes', async () => {
		expect(sniffImageType(await make('jpeg'))).toBe('jpeg');
		expect(sniffImageType(await make('png'))).toBe('png');
		expect(sniffImageType(await make('webp'))).toBe('webp');
	});

	it('rejects other content even with an image-like name', () => {
		expect(sniffImageType(new TextEncoder().encode('<svg onload=alert(1)>'))).toBeNull();
		expect(sniffImageType(new TextEncoder().encode('%PDF-1.7'))).toBeNull();
		expect(sniffImageType(new Uint8Array())).toBeNull();
	});
});

describe('normaliseDocumentPhoto', () => {
	it('re-encodes to JPEG and strips EXIF metadata (e.g. GPS)', async () => {
		const withExif = await sharp({
			create: { width: 3000, height: 1000, channels: 3, background: '#ffffff' }
		})
			.jpeg()
			.withExif({ IFD0: { Copyright: 'secret-location' } })
			.toBuffer();
		expect((await sharp(withExif).metadata()).exif).toBeDefined();

		const out = await normaliseDocumentPhoto(withExif);
		const meta = await sharp(out).metadata();
		expect(meta.format).toBe('jpeg');
		expect(meta.exif).toBeUndefined();
		expect(meta.width).toBe(2000);
	});
});
