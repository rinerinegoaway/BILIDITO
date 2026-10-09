<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import Ban from '@lucide/svelte/icons/ban';
	import Clock from '@lucide/svelte/icons/clock';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import MobileNav from '#lib/components/layout/MobileNav.svelte';
	import NavigationProgress from '#lib/components/layout/NavigationProgress.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const viewer = $derived(data.viewer);
	const onVerifyPage = $derived(page.url.pathname === '/verify');
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="32x32" href="/brand/icon-32.png" />
	<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#E53935" />
</svelte:head>

<NavigationProgress />

<a
	href="#main"
	class="sr-only z-50 rounded-lg bg-white px-4 py-2 font-medium shadow-lift focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
	>Skip to content</a
>

<SiteHeader {viewer} />

{#if viewer && viewer.status !== 'ACTIVE'}
	<div class="border-b border-red-200 bg-red-50 text-sm text-red-900" role="status">
		<p class="container-page flex items-center gap-2 py-2.5">
			<Ban class="size-4 shrink-0" aria-hidden="true" />
			Your account is {viewer.status === 'BANNED' ? 'banned' : 'suspended'}. You can browse, but you
			can't post, message or buy.
		</p>
	</div>
{:else if viewer && !viewer.isVerified && !onVerifyPage}
	<div class="border-b border-accent-200 bg-accent-50 text-sm text-slate-800">
		<p class="container-page flex items-center gap-2 py-2.5">
			{#if viewer.verificationStatus === 'PENDING'}
				<Clock class="size-4 shrink-0 text-accent-700" aria-hidden="true" />
				Your ID is being reviewed. You'll be able to sell and buy once you're verified.
			{:else}
				<ShieldCheck class="size-4 shrink-0 text-accent-700" aria-hidden="true" />
				<span>
					<a href="/verify" class="font-semibold text-brand-700 underline underline-offset-2"
						>Verify your account</a
					> to post listings and request to buy.
				</span>
			{/if}
		</p>
	</div>
{/if}

<main id="main" class="min-h-[60vh]">
	{@render children()}
</main>

<SiteFooter />
<MobileNav {viewer} />
