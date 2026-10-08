import { describe, expect, it } from 'vitest';
import { formatPeso, formatPesoRange, parsePesoToCentavos, slugify, timeAgo } from './format.ts';

describe('formatPeso', () => {
	it('formats whole and fractional pesos', () => {
		expect(formatPeso(2_500_000)).toBe('₱25,000');
		expect(formatPeso(8050)).toBe('₱80.50');
		expect(formatPeso(0)).toBe('₱0');
	});
});

describe('formatPesoRange', () => {
	it('formats a range, a single value, or nothing', () => {
		expect(formatPesoRange(8000, 12000)).toBe('₱80–₱120');
		expect(formatPesoRange(8000, 8000)).toBe('₱80');
		expect(formatPesoRange(null, 12000)).toBe('₱120');
		expect(formatPesoRange(null, null)).toBeNull();
	});
});

describe('parsePesoToCentavos', () => {
	it.each([
		['25,000', 2_500_000],
		['₱25000.5', 2_500_050],
		['PHP 80', 8000],
		['0', 0]
	])('parses %s', (input, expected) => {
		expect(parsePesoToCentavos(input)).toBe(expected);
	});

	it.each(['-5', 'abc', '1.234', '', '1e5'])('rejects %s', (input) => {
		expect(parsePesoToCentavos(input)).toBeNull();
	});
});

describe('timeAgo', () => {
	const now = new Date('2026-10-08T12:00:00Z');
	it('describes recent and older times', () => {
		expect(timeAgo(new Date('2026-10-08T11:59:30Z'), now)).toBe('just now');
		expect(timeAgo(new Date('2026-10-08T09:00:00Z'), now)).toBe('3 hours ago');
		expect(timeAgo(new Date('2026-10-07T12:00:00Z'), now)).toBe('yesterday');
	});
});

describe('slugify', () => {
	it('strips accents and punctuation', () => {
		expect(slugify('Santo Niño (Faire)')).toBe('santo-nino-faire');
		expect(slugify('Home & Living')).toBe('home-living');
		expect(slugify('Peñablanca')).toBe('penablanca');
	});
});
