<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { Snippet } from 'svelte';

	type Tone = 'info' | 'success' | 'warning' | 'error';

	let {
		tone = 'info',
		title,
		children
	}: { tone?: Tone; title?: string; children?: Snippet } = $props();

	const styles: Record<Tone, string> = {
		info: 'border-slate-200 bg-white text-slate-800 [&_svg]:text-brand-600',
		success: 'border-success-200 bg-success-50 text-success-900',
		warning: 'border-amber-200 bg-amber-50 text-amber-900',
		error: 'border-red-200 bg-red-50 text-red-900'
	};
	const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleAlert };
	const Icon = $derived(icons[tone]);
</script>

<div
	class={['flex gap-3 rounded-xl border p-3.5 text-sm leading-relaxed', styles[tone]]}
	role={tone === 'error' ? 'alert' : 'status'}
>
	<Icon class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
	<div class="flex flex-col gap-0.5">
		{#if title}<p class="font-semibold">{title}</p>{/if}
		{#if children}<div>{@render children()}</div>{/if}
	</div>
</div>
