/**
 * Shrinks a photo in the browser before upload (saves mobile data on slow connections).
 * Falls back to the original file if the browser can't decode it. The server re-validates and
 * re-encodes everything regardless.
 */
export async function compressImage(
	file: File,
	maxDimension = 2000,
	quality = 0.85
): Promise<File> {
	if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') return file;
	try {
		const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
		const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
		const width = Math.round(bitmap.width * scale);
		const height = Math.round(bitmap.height * scale);

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
		bitmap.close();

		const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
		if (!blob || blob.size >= file.size) return file;
		return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
	} catch {
		return file;
	}
}

/** Replaces every File entry under `name` in a FormData with a compressed version. */
export async function compressFormImages(formData: FormData, names: string[]) {
	for (const name of names) {
		const file = formData.get(name);
		if (file instanceof File && file.size > 0) formData.set(name, await compressImage(file));
	}
}
