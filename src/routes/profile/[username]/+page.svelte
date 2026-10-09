<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Lock from '@lucide/svelte/icons/lock';
	import Mail from '@lucide/svelte/icons/mail';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Package from '@lucide/svelte/icons/package';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Phone from '@lucide/svelte/icons/phone';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
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
	const priv = $derived(data.privateDetails);

	const verificationLabel: Record<
		string,
		{ text: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }
	> = {
		VERIFIED: { text: 'Verified', tone: 'success' },
		PENDING: { text: 'Under review', tone: 'warning' },
		REJECTED: { text: 'Not approved: resubmit', tone: 'danger' },
		UNVERIFIED: { text: 'Not verified', tone: 'neutral' }
	};
</script>

<svelte:head>
	<title>{p.name} (@{p.username}) · BILIDITO</title>
	<!-- Profiles hold real names; keep them out of search engines (spec §63). -->
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container-page flex flex-col gap-6 py-6 sm:py-8">
	<!-- Header card -->
	<section class="overflow-hidden card" aria-label="Profile">
		<div class="h-24 bg-brand-gradient opacity-90 sm:h-32" aria-hidden="true"></div>
		<div class="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:gap-6 sm:px-8 sm:pb-6">
			<Avatar name={p.name} src={p.image} size="xl" class="-mt-12 ring-4 sm:-mt-14" />
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">{p.name}</h1>
					{#if p.isVerified}<VerifiedBadge />{/if}
					{#if p.status === 'SUSPENDED'}<Badge tone="danger">Suspended</Badge>{/if}
				</div>
				<p class="text-sm text-slate-500">@{p.username}</p>
				<div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
					<span class="flex items-center gap-1.5">
						<MapPin class="size-4 text-brand-500" aria-hidden="true" />{p.municipality}, Cagayan
					</span>
					<span class="flex items-center gap-1.5">
						<CalendarDays class="size-4 text-brand-500" aria-hidden="true" />Member since {formatMonthYear(
							p.createdAt
						)}
					</span>
				</div>
			</div>
			{#if data.isOwn}
				<Button href="/settings" variant="secondary" class="w-full sm:w-auto">
					<Pencil class="size-4" aria-hidden="true" /> Edit profile
				</Button>
			{/if}
		</div>
	</section>

	<div class="grid gap-6 lg:grid-cols-[1fr_20rem]">
		<div class="flex min-w-0 flex-col gap-6">
			<dl class="grid grid-cols-3 gap-3">
				<div class="card p-4 text-center">
					<dt class="text-xs font-medium text-slate-500">Rating</dt>
					<dd class="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-slate-900">
						{#if p.rating !== null}
							<Star class="size-5 fill-accent-400 text-accent-400" aria-hidden="true" />{p.rating}
							<span class="text-xs font-normal text-slate-500">({p.ratingCount})</span>
						{:else}
							<span class="text-sm font-medium text-slate-500">No ratings yet</span>
						{/if}
					</dd>
				</div>
				<div class="card p-4 text-center">
					<dt class="text-xs font-medium text-slate-500">Completed deals</dt>
					<dd class="mt-1 text-xl font-bold text-slate-900">{p.completedOrders}</dd>
				</div>
				<div class="card p-4 text-center">
					<dt class="text-xs font-medium text-slate-500">Active listings</dt>
					<dd class="mt-1 text-xl font-bold text-slate-900">{p.activeListings}</dd>
				</div>
			</dl>

			<section class="card" aria-labelledby="listings-heading">
				<h2 id="listings-heading" class="border-b border-slate-100 px-5 py-4 font-semibold">
					Listings
				</h2>
				<EmptyState
					icon={Package}
					title={data.isOwn ? "You haven't posted anything yet" : 'No active listings'}
					description={data.isOwn
						? 'Listings you post will appear here once the marketplace opens.'
						: undefined}
				/>
			</section>

			<section class="card" aria-labelledby="reviews-heading">
				<h2 id="reviews-heading" class="border-b border-slate-100 px-5 py-4 font-semibold">
					Reviews
				</h2>
				<EmptyState
					icon={Star}
					title="No reviews yet"
					description="Reviews appear after completed transactions."
				/>
			</section>
		</div>

		{#if priv}
			<aside
				class="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start"
				aria-label="Your account"
			>
				<section class="card p-5" aria-labelledby="private-heading">
					<div class="flex items-center gap-2">
						<Lock class="size-4 text-slate-400" aria-hidden="true" />
						<h2 id="private-heading" class="font-semibold text-slate-900">Private details</h2>
					</div>
					<p class="mt-1 text-xs text-slate-500">Only you can see this.</p>
					<dl class="mt-4 flex flex-col gap-3 text-sm">
						<div class="flex items-start gap-3">
							<Mail class="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
							<div class="min-w-0">
								<dt class="text-xs text-slate-500">Email</dt>
								<dd class="truncate font-medium text-slate-800">{priv.email}</dd>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<Phone class="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
							<div>
								<dt class="text-xs text-slate-500">Mobile number</dt>
								<dd class="font-medium text-slate-800">{priv.mobileNumber}</dd>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<ShieldCheck class="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
							<div>
								<dt class="text-xs text-slate-500">Verification</dt>
								<dd class="mt-0.5">
									<Badge tone={verificationLabel[priv.verificationStatus]?.tone ?? 'neutral'}>
										{verificationLabel[priv.verificationStatus]?.text ?? priv.verificationStatus}
									</Badge>
								</dd>
							</div>
						</div>
					</dl>
					{#if priv.verificationStatus === 'UNVERIFIED' || priv.verificationStatus === 'REJECTED'}
						<Button href="/verify" fullWidth class="mt-4">Verify my account</Button>
					{/if}
				</section>
			</aside>
		{/if}
	</div>
</div>
