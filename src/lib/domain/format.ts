const wholePesos = new Intl.NumberFormat('en-PH', {
	style: 'currency',
	currency: 'PHP',
	maximumFractionDigits: 0
});
const pesosWithCentavos = new Intl.NumberFormat('en-PH', {
	style: 'currency',
	currency: 'PHP',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

/** Formats integer centavos as pesos: 2_500_000 → "₱25,000", 8050 → "₱80.50". */
export function formatPeso(centavos: number): string {
	const formatter = centavos % 100 === 0 ? wholePesos : pesosWithCentavos;
	return formatter.format(centavos / 100);
}

/** "₱80–₱120 (estimate)"-style range for delivery fees. Returns null when no estimate exists. */
export function formatPesoRange(min: number | null, max: number | null): string | null {
	if (min == null && max == null) return null;
	if (min != null && max != null && min !== max) return `${formatPeso(min)}–${formatPeso(max)}`;
	return formatPeso((min ?? max)!);
}

/**
 * Parses user input like "25,000", "₱25000.50" or "25000" into integer centavos.
 * Returns null for anything that is not a non-negative amount with at most 2 decimals.
 */
export function parsePesoToCentavos(input: string): number | null {
	const cleaned = input.replace(/[₱,\s]/g, '').replace(/^php/i, '');
	if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
	const [whole, fraction = ''] = cleaned.split('.');
	const centavos = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
	return Number.isSafeInteger(centavos) ? centavos : null;
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 365 * 24 * 3600],
	['month', 30 * 24 * 3600],
	['week', 7 * 24 * 3600],
	['day', 24 * 3600],
	['hour', 3600],
	['minute', 60]
];

/** "3 hours ago", "yesterday", "just now". */
export function timeAgo(date: Date | string, now: Date = new Date()): string {
	const seconds = Math.round((new Date(date).getTime() - now.getTime()) / 1000);
	for (const [unit, size] of UNITS) {
		if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
	}
	return 'just now';
}

/** "Member since Oct 2026". */
export function formatMonthYear(date: Date | string): string {
	return new Date(date).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' });
}

/** Turns "Santo Niño (Faire)" into "santo-nino-faire". */
export function slugify(input: string): string {
	return input
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
