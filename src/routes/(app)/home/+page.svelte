<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import Clock from '@lucide/svelte/icons/clock';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Button from '#lib/components/ui/Button.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const viewer = $derived(data.viewer!);
	const firstName = $derived(viewer.name.split(' ')[0]);
</script>

<svelte:head>
	<title>Home · BILIDITO</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container-page flex flex-col gap-6 py-8">
	<div>
		<h1 class="text-2xl font-bold text-slate-900">Hi, {firstName}!</h1>
		<p class="mt-1 flex items-center gap-1 text-sm text-slate-600">
			<MapPin class="size-4" aria-hidden="true" />
			{data.location}
		</p>
	</div>

	{#if viewer.isVerified}
		<div class="flex items-center gap-3 card border-accent-200 bg-accent-50 p-4">
			<BadgeCheck class="size-6 shrink-0 text-accent-700" aria-hidden="true" />
			<p class="text-sm text-accent-900">
				<strong>Your account is verified.</strong> You can post listings and request to buy.
			</p>
		</div>
	{:else if viewer.verificationStatus === 'PENDING'}
		<div class="flex items-center gap-3 card border-amber-200 bg-amber-50 p-4">
			<Clock class="size-6 shrink-0 text-amber-700" aria-hidden="true" />
			<p class="text-sm text-amber-900">
				<strong>Your ID is being reviewed.</strong> We'll notify you once it's approved.
			</p>
		</div>
	{:else}
		<div
			class="flex flex-col gap-3 card border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-center"
		>
			<ShieldCheck class="size-6 shrink-0 text-brand-700" aria-hidden="true" />
			<p class="flex-1 text-sm text-brand-900">
				<strong>Verify your account</strong> with a government ID to post listings and buy. It only takes
				a minute and your ID is never shown to other users.
			</p>
			<Button href="/verify">Verify now</Button>
		</div>
	{/if}

	<div class="grid gap-4 sm:grid-cols-3">
		<a href="/items" class="flex flex-col gap-2 card p-5 hover:border-brand-300">
			<LayoutGrid class="size-6 text-brand-700" aria-hidden="true" />
			<span class="font-semibold text-slate-900">Browse items</span>
			<span class="text-sm text-slate-600">See what's for sale near you.</span>
		</a>
		<a href="/items/create" class="flex flex-col gap-2 card p-5 hover:border-brand-300">
			<Plus class="size-6 text-accent-700" aria-hidden="true" />
			<span class="font-semibold text-slate-900">Sell an item</span>
			<span class="text-sm text-slate-600">Post a listing with photos in minutes.</span>
		</a>
		<a href="/messages" class="flex flex-col gap-2 card p-5 hover:border-brand-300">
			<MessageCircle class="size-6 text-brand-700" aria-hidden="true" />
			<span class="font-semibold text-slate-900">Messages</span>
			<span class="text-sm text-slate-600">Chat with buyers and sellers.</span>
		</a>
	</div>
</div>
