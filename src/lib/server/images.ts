import sharp from 'sharp';
import { ServiceError } from './errors.ts';

export type ImageKind = 'jpeg' | 'png' | 'webp';

/** Identifies an image by its magic bytes. The browser-supplied MIME type is never trusted. */
export function sniffImageType(bytes: Uint8Array): ImageKind | null {
	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return 'jpeg';
	}
	if (
		bytes.length >= 8 &&
		[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)
	) {
		return 'png';
	}
	if (
		bytes.length >= 12 &&
		String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' &&
		String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP'
	) {
		return 'webp';
	}
	return null;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Reads and validates an uploaded image file. `label` names the field in error messages. */
export async function readImageUpload(file: unknown, label: string, field: string) {
	if (!(file instanceof File) || file.size === 0) {
		throw new ServiceError('IMAGE_REQUIRED', `Add a photo of ${label}.`, 422, field);
	}
	if (file.size > MAX_UPLOAD_BYTES) {
		throw new ServiceError('IMAGE_TOO_LARGE', 'Photos must be 10 MB or smaller.', 422, field);
	}
	const bytes = new Uint8Array(await file.arrayBuffer());
	if (!sniffImageType(bytes)) {
		throw new ServiceError('IMAGE_TYPE', 'Use a JPG, PNG or WebP photo.', 422, field);
	}
	return bytes;
}

/**
 * Normalises a photo of an ID: applies EXIF orientation, caps it at 2000px and re-encodes it as
 * JPEG. Re-encoding drops all metadata, including the GPS position phones embed in photos.
 */
export async function normaliseDocumentPhoto(bytes: Uint8Array): Promise<Uint8Array> {
	try {
		return await sharp(bytes, { limitInputPixels: 50_000_000 })
			.rotate()
			.resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
			.jpeg({ quality: 85, mozjpeg: true })
			.toBuffer();
	} catch {
		throw new ServiceError('IMAGE_UNREADABLE', 'That photo could not be read. Try another.', 422);
	}
}
