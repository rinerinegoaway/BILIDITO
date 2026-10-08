<script lang="ts">
	import { page } from '$app/state';
	import { isActivePath } from '#lib/components/layout/nav.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Sections are added here as they are built (Phase 7 adds users, listings, reports, …).
	const sections = [
		{ href: '/admin', label: 'Dashboard', exact: true },
		{ href: '/admin/verifications', label: 'Verifications' }
	];
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container-page py-6">
	<div class="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
		<span class="mr-2 text-sm font-bold tracking-wide text-brand-700 uppercase">Admin</span>
		{#each sections as s (s.href)}
			{@const active = s.exact
				? page.url.pathname === s.href
				: isActivePath(page.url.pathname, s.href)}
			<a
				href={s.href}
				class={[
					'rounded-lg px-3 py-2 text-sm font-medium',
					active ? 'bg-brand-700 text-white' : 'text-slate-700 hover:bg-slate-100'
				]}
				aria-current={active ? 'page' : undefined}>{s.label}</a
			>
		{/each}
	</div>
	{@render children()}
</div>
