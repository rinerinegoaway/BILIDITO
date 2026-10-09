<script lang="ts">
	import { page } from '$app/state';
	import Bell from '@lucide/svelte/icons/bell';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Button from '#lib/components/ui/Button.svelte';
	import Logo from './Logo.svelte';
	import UserMenu from './UserMenu.svelte';
	import { isActivePath, type Viewer } from './nav.ts';

	let { viewer }: { viewer: Viewer | null } = $props();

	const links = [
		{ href: '/items', label: 'Browse Items' },
		{ href: '/categories', label: 'Categories' }
	];

	const iconLink =
		'relative inline-flex size-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-brand-700';
	const query = $derived(
		page.url.pathname === '/items' ? (page.url.searchParams.get('q') ?? '') : ''
	);
</script>

<header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
	<div class="container-page flex h-16 items-center gap-3 lg:gap-6">
		<Logo />

		<!-- Desktop navigation (≥1024px). Below that, the bottom bar carries these links. -->
		<nav class="hidden items-center gap-1 lg:flex" aria-label="Main">
			{#each links as link (link.href)}
				{@const active = isActivePath(page.url.pathname, link.href)}
				<a
					href={link.href}
					class={[
						'relative rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition',
						active ? 'text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
					]}
					aria-current={active ? 'page' : undefined}
				>
					{link.label}
					{#if active}
						<span class="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand-gradient"
						></span>
					{/if}
				</a>
			{/each}
		</nav>

		<form action="/items" method="get" role="search" class="hidden min-w-0 flex-1 md:block">
			<label class="relative block max-w-md">
				<span class="sr-only">Search items</span>
				<Search
					class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
					aria-hidden="true"
				/>
				<input
					type="search"
					name="q"
					value={query}
					placeholder="Search phones, bikes, furniture…"
					class="h-11 w-full rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
				/>
			</label>
		</form>

		<div class="ml-auto flex items-center gap-1 md:ml-0">
			<a href="/items" class={[iconLink, 'md:hidden']} aria-label="Search items">
				<Search class="size-5" />
			</a>

			{#if viewer}
				<!-- Wrappers own visibility: a component's own display class would override `hidden`. -->
				<span class="hidden lg:contents">
					<a href="/messages" class={iconLink} aria-label="Messages">
						<MessageCircle class="size-5" />
					</a>
				</span>
				<a href="/notifications" class={iconLink} aria-label="Notifications">
					<Bell class="size-5" />
				</a>
				<span class="mx-1 hidden lg:contents">
					<Button href="/items/create">
						<Plus class="size-4" aria-hidden="true" /> Sell an Item
					</Button>
				</span>
				<div class="ml-1">
					<UserMenu {viewer} />
				</div>
			{:else}
				<div class="hidden items-center gap-2 lg:flex">
					<Button href="/login" variant="ghost">Log in</Button>
					<Button href="/register" variant="secondary">Register</Button>
					<Button href="/items/create">
						<Plus class="size-4" aria-hidden="true" /> Sell an Item
					</Button>
				</div>
				<div class="flex items-center gap-2 lg:hidden">
					<Button href="/login" variant="ghost" size="sm">Log in</Button>
					<Button href="/register" size="sm">Join</Button>
				</div>
			{/if}
		</div>
	</div>
</header>
