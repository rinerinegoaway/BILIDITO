<script lang="ts">
	import { page } from '$app/state';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Package from '@lucide/svelte/icons/package';
	import Settings from '@lucide/svelte/icons/settings';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Heart from '@lucide/svelte/icons/heart';
	import VerifiedBadge from '#lib/components/ui/VerifiedBadge.svelte';
	import Avatar from './Avatar.svelte';
	import type { Viewer } from './nav.ts';

	/**
	 * Account menu (menu-button pattern): Enter/Space/↓ opens, ↑/↓ move, Esc closes and returns
	 * focus, clicking outside closes. Log out is a real POST form, so it works without JS.
	 */
	let { viewer }: { viewer: Viewer } = $props();

	let open = $state(false);
	let root: HTMLDivElement | undefined = $state();
	let trigger: HTMLButtonElement | undefined = $state();
	const menuId = $props.id();

	const items = $derived([
		{ href: `/profile/${viewer.username}`, label: 'My profile', icon: UserRound },
		{ href: '/settings', label: 'Account settings', icon: Settings },
		{ href: '/orders', label: 'Orders', icon: Package },
		{ href: '/favorites', label: 'Favorites', icon: Heart },
		...(!viewer.isVerified
			? [{ href: '/verify', label: 'Verify my account', icon: ShieldCheck }]
			: []),
		...(viewer.isAdmin ? [{ href: '/admin', label: 'Admin dashboard', icon: LayoutDashboard }] : [])
	]);

	function menuItems(): HTMLElement[] {
		return Array.from(root?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
	}

	function openMenu(focusIndex = 0) {
		open = true;
		requestAnimationFrame(() => menuItems().at(focusIndex)?.focus());
	}

	function close(returnFocus = false) {
		open = false;
		if (returnFocus) trigger?.focus();
	}

	function onTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			openMenu(0);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			openMenu(-1);
		}
	}

	function onMenuKeydown(e: KeyboardEvent) {
		const list = menuItems();
		const index = list.indexOf(document.activeElement as HTMLElement);
		if (e.key === 'Escape') {
			e.preventDefault();
			close(true);
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const delta = e.key === 'ArrowDown' ? 1 : -1;
			list[(index + delta + list.length) % list.length]?.focus();
		} else if (e.key === 'Home' || e.key === 'End') {
			e.preventDefault();
			(e.key === 'Home' ? list[0] : list.at(-1))?.focus();
		} else if (e.key === 'Tab') {
			close();
		}
	}

	// Close after navigating.
	$effect(() => {
		void page.url.pathname;
		open = false;
	});
</script>

<svelte:window
	onclick={(e) => {
		if (open && root && !root.contains(e.target as Node)) close();
	}}
/>

<div class="relative" bind:this={root}>
	<button
		bind:this={trigger}
		type="button"
		class="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition hover:bg-slate-100 aria-expanded:bg-slate-100"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-controls={menuId}
		aria-label="Account menu for {viewer.name}"
		onclick={() => (open ? close() : openMenu(0))}
		onkeydown={onTriggerKeydown}
	>
		<Avatar name={viewer.name} src={viewer.image} size="sm" />
		<ChevronDown
			class={['size-4 text-slate-500 transition-transform', open && 'rotate-180']}
			aria-hidden="true"
		/>
	</button>

	{#if open}
		<div
			id={menuId}
			role="menu"
			tabindex="-1"
			aria-label="Account"
			onkeydown={onMenuKeydown}
			class="absolute right-0 z-40 mt-2 w-[min(18rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift"
		>
			<div class="flex items-center gap-3 bg-slate-50 px-4 py-3">
				<Avatar name={viewer.name} src={viewer.image} size="md" />
				<div class="min-w-0">
					<p class="truncate text-sm font-semibold text-slate-900">{viewer.name}</p>
					<p class="truncate text-xs text-slate-500">{viewer.email}</p>
					{#if viewer.isVerified}<VerifiedBadge />{/if}
				</div>
			</div>
			<div class="py-1.5">
				{#each items as item (item.href)}
					<a
						href={item.href}
						role="menuitem"
						tabindex="-1"
						class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none hover:bg-brand-50 hover:text-brand-800 focus:bg-brand-50 focus:text-brand-800"
					>
						<item.icon class="size-4 text-slate-400" aria-hidden="true" />
						{item.label}
					</a>
				{/each}
			</div>
			<form method="post" action="/logout" class="border-t border-slate-100 py-1.5">
				<button
					type="submit"
					role="menuitem"
					tabindex="-1"
					class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 outline-none hover:bg-brand-50 hover:text-brand-800 focus:bg-brand-50 focus:text-brand-800"
				>
					<LogOut class="size-4 text-slate-400" aria-hidden="true" />
					Log out
				</button>
			</form>
		</div>
	{/if}
</div>
