<script lang="ts" module>
	export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tone = 'neutral',
		class: className,
		children
	}: { tone?: BadgeTone; class?: string; children: Snippet } = $props();

	const tones: Record<BadgeTone, string> = {
		neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
		brand: 'bg-brand-50 text-brand-800 ring-brand-200',
		accent: 'bg-accent-50 text-accent-800 ring-accent-200',
		success: 'bg-success-50 text-success-800 ring-success-200',
		warning: 'bg-amber-50 text-amber-800 ring-amber-200',
		danger: 'bg-red-50 text-red-700 ring-red-200'
	};
</script>

<span
	class={[
		'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
		tones[tone],
		className
	]}
>
	{@render children()}
</span>
