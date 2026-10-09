<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	/** The last crumb is the current page and is not a link. */
	let { items }: { items: { label: string; href?: string }[] } = $props();
</script>

<nav aria-label="Breadcrumb" class="mb-3">
	<ol class="flex flex-wrap items-center gap-1 text-sm text-slate-500">
		{#each items as item, i (i)}
			<li class="flex items-center gap-1">
				{#if i > 0}<ChevronRight class="size-3.5 text-slate-400" aria-hidden="true" />{/if}
				{#if item.href && i < items.length - 1}
					<a href={item.href} class="font-medium hover:text-brand-700 hover:underline"
						>{item.label}</a
					>
				{:else}
					<span aria-current="page" class="font-medium text-slate-800">{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
