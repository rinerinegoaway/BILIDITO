<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Admin · BILIDITO</title></svelte:head>

<h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
<ul class="mt-4 grid gap-4 sm:grid-cols-3">
	{#each data.stats as stat (stat.label)}
		<li class="card p-5">
			<p class="text-sm text-slate-600">{stat.label}</p>
			<p class="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
			{#if stat.href && stat.value > 0}
				<a
					href={stat.href}
					class="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline"
					>Review now →</a
				>
			{/if}
		</li>
	{/each}
</ul>
