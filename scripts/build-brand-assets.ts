/**
 * Generates web-ready brand assets from the master logo (src/image/BILIDITO Eagle Marketplace Logo.png):
 *   static/brand/logo-full.webp     full logo (eagle + cart + wordmark + tagline), trimmed
 *   static/brand/logo-mark.webp     eagle + cart mark only, for the header
 *   static/brand/icon-{32,192,512}.png, apple-touch-icon.png, static/favicon.ico (PNG data)
 *
 *   bun scripts/build-brand-assets.ts
 */
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const SOURCE = 'src/image/BILIDITO Eagle Marketplace Logo.png';
const OUT = 'static/brand';
mkdirSync(OUT, { recursive: true });

const meta = await sharp(SOURCE).metadata();
const W = meta.width!;
const H = meta.height!;
// The mark sits above the wordmark; the wordmark starts at ~67.5% of the height.
const splitY = Math.round(H * 0.675);

const trimmed = (input: sharp.Sharp) => input.trim({ threshold: 10 });

// Full logo
const full = await trimmed(sharp(SOURCE)).toBuffer({ resolveWithObject: true });
await sharp(full.data)
	.resize({ width: 720, withoutEnlargement: true })
	.webp({ quality: 88 })
	.toFile(`${OUT}/logo-full.webp`);

// Mark (eagle + cart)
const markTop = await sharp(SOURCE)
	.extract({ left: 0, top: 0, width: W, height: splitY })
	.png()
	.toBuffer();
const markBuf = await trimmed(sharp(markTop)).toBuffer();
await sharp(markBuf)
	.resize({ height: 160, withoutEnlargement: true })
	.webp({ quality: 90 })
	.toFile(`${OUT}/logo-mark.webp`);

// Square icons: mark centred on transparent (favicon) or white (touch icon) canvas
async function squareIcon(size: number, file: string, background: sharp.Color, padding = 0.08) {
	const inner = Math.round(size * (1 - padding * 2));
	const mark = await sharp(markBuf)
		.resize({
			width: inner,
			height: inner,
			fit: 'contain',
			background: { r: 0, g: 0, b: 0, alpha: 0 }
		})
		.toBuffer();
	await sharp({ create: { width: size, height: size, channels: 4, background } })
		.composite([{ input: mark, gravity: 'center' }])
		.png({ compressionLevel: 9 })
		.toFile(file);
}

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const white = { r: 255, g: 255, b: 255, alpha: 1 };
await squareIcon(32, `${OUT}/icon-32.png`, transparent, 0.02);
await squareIcon(192, `${OUT}/icon-192.png`, white);
await squareIcon(512, `${OUT}/icon-512.png`, white);
await squareIcon(180, `${OUT}/apple-touch-icon.png`, white);
// Browsers accept PNG data in favicon.ico; this silences the automatic /favicon.ico request.
await squareIcon(48, 'static/favicon.ico', transparent, 0.02);

for (const f of [
	'logo-full.webp',
	'logo-mark.webp',
	'icon-32.png',
	'icon-192.png',
	'icon-512.png',
	'apple-touch-icon.png'
]) {
	const m = await sharp(`${OUT}/${f}`).metadata();
	console.log(
		`${f}: ${m.width}×${m.height}, ${((await Bun.file(`${OUT}/${f}`).size) / 1024).toFixed(1)} KB`
	);
}
