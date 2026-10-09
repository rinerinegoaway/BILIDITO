<script lang="ts">
	import { page } from '$app/state';
	import House from '@lucide/svelte/icons/house';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import UserRound from '@lucide/svelte/icons/user-round';
	import { isActivePath, type Viewer } from './nav.ts';

	let { viewer }: { viewer: Viewer | null } = $props();

	const items = $derived([
		{ href: viewer ? '/home' : '/', label: 'Home', icon: House, match: [viewer ? '/home' : '/'] },
		{ href: '/items', label: 'Browse', icon: LayoutGrid, match: ['/items', '/categories'] },
		{ href: '/items/create', label: 'Sell', icon: Plus, primary: true, match: ['/items/create'] },
		{ href: '/messages', label: 'Messages', icon: MessageCircle, match: ['/messages'] },
		{
			href: viewer ? `/profile/${viewer.username}` : '/login',
			label: viewer ? 'Profile' : 'Log in',
			icon: UserRound,
			match: viewer ? ['/profile', '/settings', '/verify'] : ['/login', '/register']
		}
	]);

	const isActive = (match: string[]) =>
		page.url.pathname !== '/items/create' || match.includes('/items/create')
			? match.some((m) => isActivePath(page.url.pathname, m))
			: false;
</script>

<!-- Bottom navigation for phones and tablets (spec §51). The header carries these links from lg up. -->
<nav
	class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-8px_rgb(66_32_20/0.12)] backdrop-blur-md lg:hidden"
	aria-label="Primary"
>
	<ul class="mx-auto grid max-w-lg grid-cols-5">
		{#each items as item (item.label)}
			{@const active = isActive(item.match)}
			<li>
				<a
					href={item.href}
					class={[
						'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition',
						active ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'
					]}
					aria-current={active ? 'page' : undefined}
				>
					{#if item.primary}
						<span
							class="-mt-5 flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg ring-4 shadow-brand-900/25 ring-white"
						>
							<item.icon class="size-6" aria-hidden="true" />
						</span>
					{:else}
						<span
							class={[
								'flex h-7 w-12 items-center justify-center rounded-full transition',
								active && 'bg-brand-50'
							]}
						>
							<item.icon class="size-5" aria-hidden="true" />
						</span>
					{/if}
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
