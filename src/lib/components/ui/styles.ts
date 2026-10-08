/** Shared control classes so inputs, selects and textareas look identical. */
export const controlClass = (invalid = false) => [
	'block w-full rounded-lg border bg-white px-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400',
	'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none',
	'disabled:bg-slate-100 disabled:text-slate-500',
	invalid ? 'border-red-500' : 'border-slate-300'
];
