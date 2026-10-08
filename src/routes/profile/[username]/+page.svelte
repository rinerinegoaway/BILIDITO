<script lang="ts">
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Package from '@lucide/svelte/icons/package';
	import Star from '@lucide/svelte/icons/star';
	import Avatar from '#lib/components/layout/Avatar.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import VerifiedBadge from '#lib/components/ui/VerifiedBadge.svelte';
	import { formatMonthYear } from '#lib/domain/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const p = $derived(data.profile);
</script>

<svelte:head>
	<title>{p.name} (@{p.username}) · BILIDITO</title>
	<!-- Profiles hold real names; keep them out of search engines (spec §63). -->
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container-page flex flex-col gap-6 py-8">
	<section class="flex flex-col gap-5 card p-5 sm:flex-row sm:items-center sm:p-6">
		<Avatar name={p.name} src={p.image} size="lg" />
		<div class="flex flex-1 flex-col gap-1">
			<div class="flex flex-wrap items-center gap-2">
				<h1 class="text-2xl font-bold text-slate-900">{p.name}</h1>
				{#if p.isVerified}<VerifiedBadge />{/if}
				{#if p.status === 'SUSPENDED'}<Badge tone="danger">Suspended</Badge>{/if}
			</div>
			<p class="text-sm text-slate-500">@{p.username}</p>
			<p class="flex items-center gap-1 text-sm text-slate-600">
				<MapPin class="size-4" aria-hidden="true" />
				{p.municipality}, Cagayan · Member since {formatMonthYear(p.createdAt)}
			</p>
		</div>
		{#if data.isOwn}
			<div class="flex gap-2">
				<Button href="/settings" variant="secondary">Edit profile</Button>
				<form method="post" action="/logout">
					<Button type="submit" variant="ghost">Log out</Button>
				</form>
			</div>
		{/if}
	</section>

	<dl class="grid grid-cols-3 gap-3">
		<div class="card p-4 text-center">
			<dt class="text-xs text-slate-500">Rating</dt>
			<dd class="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-slate-900">
				{#if p.rating !== null}
					<Star class="size-5 fill-amber-400 text-amber-400" aria-hidden="true" />{p.rating}
					<span class="text-xs font-normal text-slate-500">({p.ratingCount})</span>
				{:else}
					<span class="text-sm font-medium text-slate-500">No ratings yet</span>
				{/if}
			</dd>
		</div>
		<div class="card p-4 text-center">
			<dt class="text-xs text-slate-500">Completed transactions</dt>
			<dd class="mt-1 text-xl font-bold text-slate-900">{p.completedOrders}</dd>
		</div>
		<div class="card p-4 text-center">
			<dt class="text-xs text-slate-500">Active listings</dt>
			<dd class="mt-1 text-xl font-bold text-slate-900">{p.activeListings}</dd>
		</div>
	</dl>

	<section class="card" aria-labelledby="listings-heading">
		<h2 id="listings-heading" class="border-b border-slate-100 px-5 py-3 font-semibold">
			Listings
		</h2>
		<EmptyState
			icon={Package}
			title={data.isOwn ? "You haven't posted anything yet" : 'No active listings'}
			description={data.isOwn ? 'Items you post will appear here.' : undefined}
		/>
	</section>

	<section class="card" aria-labelledby="reviews-heading">
		<h2 id="reviews-heading" class="border-b border-slate-100 px-5 py-3 font-semibold">Reviews</h2>
		<EmptyState
			icon={Star}
			title="No reviews yet"
			description="Reviews appear after completed transactions."
		/>
	</section>
</div>
