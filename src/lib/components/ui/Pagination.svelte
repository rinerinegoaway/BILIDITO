<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	/** Link-based pagination, so it works without JavaScript and pages are shareable. */
	let {
		page,
		totalPages,
		href
	}: { page: number; totalPages: number; href: (page: number) => string } = $props();

	const linkClass =
		'inline-flex h-11 items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50';
</script>

{#if totalPages > 1}
	<nav class="flex items-center justify-between gap-3 py-4" aria-label="Pagination">
		{#if page > 1}
			<a class={linkClass} href={href(page - 1)} rel="prev">
				<ChevronLeft class="size-4" aria-hidden="true" /> Previous
			</a>
		{:else}
			<span></span>
		{/if}
		<span class="text-sm text-slate-600">Page {page} of {totalPages}</span>
		{#if page < totalPages}
			<a class={linkClass} href={href(page + 1)} rel="next">
				Next <ChevronRight class="size-4" aria-hidden="true" />
			</a>
		{:else}
			<span></span>
		{/if}
	</nav>
{/if}
