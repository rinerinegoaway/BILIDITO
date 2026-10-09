<script lang="ts">
	import type { Snippet } from 'svelte';
	import Logo from './Logo.svelte';

	let {
		title,
		subtitle,
		wide = false,
		children,
		footer
	}: {
		title: string;
		subtitle?: string;
		wide?: boolean;
		children: Snippet;
		footer?: Snippet;
	} = $props();
</script>

<div class="container-page flex justify-center py-8 sm:py-14">
	<div class={['w-full', wide ? 'max-w-2xl' : 'max-w-md']}>
		<div class="mx-auto mb-5 w-36 sm:w-44"><Logo variant="full" /></div>
		<div class="relative overflow-hidden card p-6 sm:p-8">
			<div class="absolute inset-x-0 top-0 h-1 bg-brand-gradient" aria-hidden="true"></div>
			<h1 class="text-2xl font-bold text-slate-900">{title}</h1>
			{#if subtitle}<p class="mt-1 text-sm text-slate-600">{subtitle}</p>{/if}
			<div class="mt-6">{@render children()}</div>
		</div>
		{#if footer}
			<div class="mt-4 text-center text-sm text-slate-600">{@render footer()}</div>
		{/if}
	</div>
</div>
