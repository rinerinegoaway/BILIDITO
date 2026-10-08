<script lang="ts">
	import Logo from './Logo.svelte';

	const links = [
		{ href: '/about', label: 'About' },
		{ href: '/terms', label: 'Terms' },
		{ href: '/privacy', label: 'Privacy' },
		{ href: '/guidelines', label: 'Community Guidelines' },
		{ href: '/contact', label: 'Contact' },
		{ href: '/help', label: 'Help' }
	];
</script>

<footer class="mt-16 border-t border-slate-200 bg-white pb-20 lg:pb-0">
	<div
		class="container-page flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between"
	>
		<div class="flex flex-col gap-2">
			<Logo />
			<p class="text-sm text-slate-600">Buy Nearby. Sell Safely. Connect Locally.</p>
		</div>
		<nav aria-label="Footer">
			<ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
				{#each links as link (link.href)}
					<li><a href={link.href} class="hover:text-brand-700 hover:underline">{link.label}</a></li>
				{/each}
			</ul>
		</nav>
	</div>
	<div class="container-page border-t border-slate-100 py-4 text-xs text-slate-500">
		© {new Date().getFullYear()} BILIDITO · Your local marketplace in Cagayan
	</div>
</footer>
