<script lang="ts">
	import { page } from '$app/state';
	import House from '@lucide/svelte/icons/house';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import User from '@lucide/svelte/icons/user';
	import { isActivePath, type Viewer } from './nav.ts';

	let { viewer }: { viewer: Viewer | null } = $props();

	const items = $derived([
		{ href: viewer ? '/home' : '/', label: 'Home', icon: House },
		{ href: '/items', label: 'Browse', icon: LayoutGrid },
		{ href: '/items/create', label: 'Sell', icon: Plus, primary: true },
		{ href: '/messages', label: 'Messages', icon: MessageCircle },
		{ href: viewer ? `/profile/${viewer.username}` : '/login', label: 'Account', icon: User }
	]);
</script>

<!-- Bottom navigation for phones (spec §51). Hidden from lg upwards, where the header has these links. -->
<nav
	class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
	aria-label="Primary"
>
	<ul class="grid grid-cols-5">
		{#each items as item (item.label)}
			{@const active = isActivePath(page.url.pathname, item.href)}
			<li>
				<a
					href={item.href}
					class={[
						'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium',
						active ? 'text-brand-700' : 'text-slate-500'
					]}
					aria-current={active ? 'page' : undefined}
				>
					{#if item.primary}
						<span
							class="flex size-9 items-center justify-center rounded-full bg-accent-700 text-white shadow"
						>
							<item.icon class="size-5" aria-hidden="true" />
						</span>
					{:else}
						<item.icon class="size-5" aria-hidden="true" />
					{/if}
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
