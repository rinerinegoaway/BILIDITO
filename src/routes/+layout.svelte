<script lang="ts">
	import './layout.css';
	import MobileNav from '#lib/components/layout/MobileNav.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#0B3D91" />
</svelte:head>

<a
	href="#main"
	class="sr-only z-50 rounded-md bg-white px-4 py-2 font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
	>Skip to content</a
>

<SiteHeader viewer={data.viewer} />

{#if data.viewer && data.viewer.status !== 'ACTIVE'}
	<div class="border-b border-red-200 bg-red-50 text-sm text-red-900" role="status">
		<p class="container-page py-2">
			Your account is {data.viewer.status === 'BANNED' ? 'banned' : 'suspended'}. You can browse,
			but you can't post, message or buy.
		</p>
	</div>
{:else if data.viewer && !data.viewer.isVerified}
	<div class="border-b border-amber-200 bg-amber-50 text-sm text-amber-900">
		<p class="container-page py-2">
			{#if data.viewer.verificationStatus === 'PENDING'}
				Your ID is being reviewed. You'll be able to sell and buy once you're verified.
			{:else}
				<a href="/verify" class="font-semibold underline">Verify your account</a> to post listings and
				request to buy.
			{/if}
		</p>
	</div>
{/if}

<main id="main" class="min-h-[60vh]">
	{@render children()}
</main>

<SiteFooter />
<MobileNav viewer={data.viewer} />
