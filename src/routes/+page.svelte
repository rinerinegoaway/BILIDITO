<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import Flag from '@lucide/svelte/icons/flag';
	import MapPin from '@lucide/svelte/icons/map-pin';
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
			text: 'See items from your town first, from Tuguegarao to Aparri and across Cagayan.'
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
</script>

<svelte:head>
	<title>BILIDITO · Buy Nearby. Sell Safely. Connect Locally.</title>
	<meta
		name="description"
		content="BILIDITO is Cagayan's local buy & sell marketplace. Discover items from verified sellers near you, message them, and meet up safely."
	/>
	<meta property="og:title" content="BILIDITO · Your Local Marketplace in Cagayan" />
	<meta
		property="og:description"
		content="Discover products from verified sellers across Cagayan Province."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<section class="border-b border-slate-200 bg-white">
	<div class="container-page grid gap-8 py-12 md:grid-cols-2 md:items-center md:py-20">
		<div class="flex flex-col gap-5">
			<p
				class="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-800"
			>
				<MapPin class="size-3.5" aria-hidden="true" /> Now serving Cagayan Province
			</p>
			<h1 class="text-4xl leading-tight font-extrabold tracking-tight text-slate-900 md:text-5xl">
				Buy Nearby. <span class="text-brand-700">Sell Safely.</span> Connect Locally.
			</h1>
			<p class="text-lg text-slate-600">
				Discover products from verified sellers across Cagayan Province.
			</p>
			<div class="flex flex-col gap-3 sm:flex-row">
				<Button href="/items" size="lg">Browse Items</Button>
				<Button href="/items/create" variant="accent" size="lg">Sell an Item</Button>
			</div>
		</div>
		<div class="hidden md:block" aria-hidden="true">
			<div class="grid grid-cols-2 gap-3 card p-4">
				{#each ['Tuguegarao City', 'Aparri', 'Solana', 'Tuao'] as town (town)}
					<div class="rounded-lg border border-slate-100 bg-canvas p-3">
						<div class="mb-3 aspect-[4/3] rounded-md bg-brand-100"></div>
						<div class="h-3 w-3/4 rounded bg-slate-200"></div>
						<div class="mt-2 h-4 w-1/2 rounded bg-brand-200"></div>
						<p class="mt-2 flex items-center gap-1 text-xs text-slate-500">
							<MapPin class="size-3" />
							{town}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<section class="container-page py-12" aria-labelledby="trust-heading">
	<h2 id="trust-heading" class="text-2xl font-bold text-slate-900">A marketplace you can trust</h2>
	<ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each trust as item (item.title)}
			<li class="flex flex-col gap-2 card p-5">
				<item.icon class="size-6 text-brand-700" aria-hidden="true" />
				<h3 class="font-semibold text-slate-900">{item.title}</h3>
				<p class="text-sm text-slate-600">{item.text}</p>
			</li>
		{/each}
	</ul>
</section>
