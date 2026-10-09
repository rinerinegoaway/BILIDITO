<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import Flag from '@lucide/svelte/icons/flag';
	import Truck from '@lucide/svelte/icons/truck';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Search from '@lucide/svelte/icons/search';
	import Star from '@lucide/svelte/icons/star';
	import Button from '#lib/components/ui/Button.svelte';

	// Categories and nearby listings join this page in Phase 3 once they come from the database.
	const trust = [
		{
			icon: BadgeCheck,
			title: 'Verified Users',
			text: 'Sellers confirm their identity with a government ID before they can post.'
		},
		{
			icon: MapPin,
			title: 'Local Listings',
			text: 'See items from your own town first, from Tuguegarao to Aparri and across Cagayan.'
		},
		{
			icon: Star,
			title: 'Ratings & Reviews',
			text: 'Buyers and sellers rate each other after every completed transaction.'
		},
		{
			icon: Flag,
			title: 'Report & Moderation',
			text: 'Report suspicious listings or users. Our team reviews every report.'
		}
	];

	const steps = [
		{
			icon: Search,
			title: 'Find it nearby',
			text: 'Search and filter listings by town and distance.'
		},
		{
			icon: MessageCircle,
			title: 'Message the seller',
			text: 'Ask questions, then send a Request to Buy.'
		},
		{
			icon: Truck,
			title: 'Ship It Locally',
			// Delivery is arranged between buyer and seller; BILIDITO doesn't run a courier service.
			text: 'Arrange delivery with the seller to send and receive items across Cagayan Province.'
		}
	];
</script>

<svelte:head>
	<title>BILIDITO · Buy Nearby. Sell Safely. Connect Locally.</title>
	<meta
		name="description"
		content="BILIDITO is Cagayan's local buy & sell marketplace. Discover items from verified sellers near you, message them, and ship it locally."
	/>
	<meta property="og:title" content="BILIDITO · Your Local Marketplace in Cagayan" />
	<meta
		property="og:description"
		content="Discover products from verified sellers across Cagayan Province."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<section class="relative overflow-hidden border-b border-slate-200 bg-white">
	<!-- Soft brand glow; decorative only. -->
	<div
		class="pointer-events-none absolute -top-40 -right-32 size-[28rem] rounded-full bg-accent-200/40 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -bottom-48 -left-40 size-[26rem] rounded-full bg-brand-200/30 blur-3xl"
		aria-hidden="true"
	></div>

	<div
		class="relative container-page grid gap-8 py-10 md:grid-cols-2 md:items-center md:gap-10 md:py-16"
	>
		<div class="order-2 flex flex-col gap-5 md:order-1">
			<p
				class="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800"
			>
				<MapPin class="size-3.5" aria-hidden="true" /> Now serving Cagayan Province
			</p>
			<h1
				class="text-[2.125rem] leading-[1.1] font-bold tracking-tight text-balance text-slate-900 sm:text-5xl lg:text-6xl"
			>
				Buy and Sell Your Items <span class="text-brand-gradient">Locally!</span>
			</h1>
			<p class="max-w-md text-base text-slate-600 sm:text-lg">
				Discover products from sellers across Cagayan Province.
			</p>
			<div class="flex flex-col gap-3 sm:flex-row">
				<Button href="/items" size="lg">
					Browse Items <ArrowRight class="size-4" aria-hidden="true" />
				</Button>
				<Button href="/items/create" variant="secondary" size="lg">Sell an Item</Button>
			</div>
			<p class="flex items-center gap-2 text-sm text-slate-500">
				<BadgeCheck class="size-4 text-success-700" aria-hidden="true" />
				Every seller is ID-verified. No payments through the app.
			</p>
		</div>

		<div class="order-1 mx-auto w-full max-w-[15rem] md:order-2 md:max-w-none lg:max-w-md">
			<img
				src="/brand/logo-full.webp"
				alt="BILIDITO logo: an eagle with a shopping cart. Buy, Sell, Near You."
				width="720"
				height="664"
				class="h-auto w-full drop-shadow-xl"
				fetchpriority="high"
			/>
		</div>
	</div>
</section>

<section class="container-page py-14" aria-labelledby="how-heading">
	<h2 id="how-heading" class="text-2xl font-bold text-slate-900 sm:text-3xl">How BILIDITO works</h2>
	<ol class="mt-6 grid gap-4 sm:grid-cols-3">
		{#each steps as step, i (step.title)}
			<li class="flex gap-4 card p-5">
				<span
					class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white"
					>{i + 1}</span
				>
				<div>
					<h3 class="flex items-center gap-2 font-semibold text-slate-900">
						<step.icon class="size-4 text-brand-600" aria-hidden="true" />{step.title}
					</h3>
					<p class="mt-1 text-sm text-slate-600">{step.text}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>

<section class="border-y border-slate-200 bg-white py-14" aria-labelledby="trust-heading">
	<div class="container-page">
		<h2 id="trust-heading" class="text-2xl font-bold text-slate-900 sm:text-3xl">
			A marketplace you can trust
		</h2>
		<p class="mt-2 max-w-2xl text-slate-600">
			Built for neighbours: real people, real items, and a team that keeps it safe.
		</p>
		<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each trust as item (item.title)}
				<li class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-canvas p-5">
					<span class="flex size-11 items-center justify-center rounded-xl bg-white shadow-card">
						<item.icon class="size-5 text-brand-600" aria-hidden="true" />
					</span>
					<h3 class="font-semibold text-slate-900">{item.title}</h3>
					<p class="text-sm text-slate-600">{item.text}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="container-page py-14">
	<div
		class="flex flex-col items-start gap-5 rounded-3xl bg-brand-gradient p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10"
	>
		<div>
			<h2 class="text-2xl font-bold sm:text-3xl">Have something to sell?</h2>
			<p class="mt-2 text-white/90">Join free, verify once, and reach buyers in your own town.</p>
		</div>
		<a
			href="/register"
			class="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-brand-800 shadow-sm transition hover:bg-brand-50 active:scale-[0.98]"
		>
			Create a free account <ArrowRight class="size-4" aria-hidden="true" />
		</a>
	</div>
</section>
