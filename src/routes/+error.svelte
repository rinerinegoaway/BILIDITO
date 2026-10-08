<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/ui/Button.svelte';

	const title = $derived(
		page.status === 404
			? 'Page not found'
			: page.status === 403
				? 'Not allowed'
				: 'Something went wrong. Please try again.'
	);
</script>

<svelte:head>
	<title>{title} · BILIDITO</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container-page flex flex-col items-center gap-4 py-20 text-center">
	<p class="text-sm font-semibold text-brand-700">Error {page.status}</p>
	<h1 class="text-2xl font-bold text-slate-900">{title}</h1>
	{#if page.status !== 500 && page.error?.message}
		<p class="max-w-md text-slate-600">{page.error.message}</p>
	{/if}
	<div class="flex gap-3">
		<Button href="/">Go home</Button>
		<Button href="/items" variant="secondary">Browse items</Button>
	</div>
</div>
