/** Shared control classes so inputs, selects and textareas look identical. */
export const controlClass = (invalid = false) => [
	'block w-full rounded-xl border bg-white px-3.5 text-base text-slate-900 shadow-xs transition placeholder:text-slate-400',
	'hover:border-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none',
	'disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500',
	invalid ? 'border-red-600 focus:border-red-600 focus:ring-red-600/15' : 'border-slate-300'
];
