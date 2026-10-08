<script lang="ts">
	import { page } from '$app/state';
	import Bell from '@lucide/svelte/icons/bell';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Button from '#lib/components/ui/Button.svelte';
	import Avatar from './Avatar.svelte';
	import Logo from './Logo.svelte';
	import { isActivePath, type Viewer } from './nav.ts';

	let { viewer }: { viewer: Viewer | null } = $props();

	const links = [
		{ href: '/items', label: 'Browse Items' },
		{ href: '/categories', label: 'Categories' }
	];

	const iconLink =
		'relative inline-flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100';
</script>

<header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
	<div class="container-page flex h-16 items-center gap-4">
		<Logo />

		<nav class="hidden items-center gap-1 lg:flex" aria-label="Main">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class={[
						'rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap',
						isActivePath(page.url.pathname, link.href)
							? 'bg-brand-50 text-brand-800'
							: 'text-slate-700 hover:bg-slate-100'
					]}
					aria-current={isActivePath(page.url.pathname, link.href) ? 'page' : undefined}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<form action="/items" method="get" role="search" class="hidden flex-1 lg:block">
			<label class="relative block max-w-md">
				<span class="sr-only">Search items</span>
				<Search
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
					aria-hidden="true"
				/>
				<input
					type="search"
					name="q"
					value={page.url.pathname === '/items' ? (page.url.searchParams.get('q') ?? '') : ''}
					placeholder="Search phones, bikes, furniture…"
					class="h-10 w-full rounded-lg border-slate-300 bg-slate-50 pl-9 text-sm focus:border-brand-500 focus:bg-white focus:ring-brand-500/30"
				/>
			</label>
		</form>

		<div class="ml-auto flex items-center gap-1 lg:ml-0">
			<a href="/items" class={[iconLink, 'lg:hidden']} aria-label="Search items">
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
				<span class="ml-2 hidden lg:contents">
					<Button href="/items/create" variant="accent">
						<Plus class="size-4" aria-hidden="true" /> Sell an Item
					</Button>
				</span>
				<details class="relative ml-1 hidden lg:block">
					<summary
						class="flex cursor-pointer list-none items-center rounded-full [&::-webkit-details-marker]:hidden"
						aria-label="Account menu"
					>
						<Avatar name={viewer.name} src={viewer.image} size="sm" />
					</summary>
					<div
						class="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
					>
						<p class="truncate px-4 py-2 text-sm font-semibold text-slate-900">
							{viewer.name}
							<span class="block text-xs font-normal text-slate-500">@{viewer.username}</span>
						</p>
						<hr class="my-1 border-slate-100" />
						{#each [{ href: `/profile/${viewer.username}`, label: 'My profile' }, { href: '/orders', label: 'Orders' }, { href: '/favorites', label: 'Favorites' }, { href: '/settings', label: 'Settings' }] as item (item.href)}
							<a href={item.href} class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
								>{item.label}</a
							>
						{/each}
						{#if viewer.isAdmin}
							<a
								href="/admin"
								class="block px-4 py-2 text-sm font-medium text-brand-700 hover:bg-slate-50"
								>Admin dashboard</a
							>
						{/if}
						<hr class="my-1 border-slate-100" />
						<form method="post" action="/logout">
							<button
								type="submit"
								class="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
								>Log out</button
							>
						</form>
					</div>
				</details>
			{:else}
				<div class="hidden items-center gap-2 whitespace-nowrap lg:flex">
					<Button href="/login" variant="ghost">Log in</Button>
					<Button href="/register" variant="secondary">Register</Button>
					<Button href="/items/create" variant="accent">
						<Plus class="size-4" aria-hidden="true" /> Sell an Item
					</Button>
				</div>
				<div class="lg:hidden">
					<Button href="/login" variant="primary" size="sm">Log in</Button>
				</div>
			{/if}
		</div>
	</div>
</header>
