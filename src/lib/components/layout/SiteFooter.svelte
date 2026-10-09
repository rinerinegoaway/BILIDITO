<script lang="ts">
	import Logo from './Logo.svelte';

	const groups = [
		{
			title: 'BILIDITO',
			links: [
				{ href: '/about', label: 'About' },
				{ href: '/help', label: 'Help' },
				{ href: '/contact', label: 'Contact' }
			]
		},
		{
			title: 'Policies',
			links: [
				{ href: '/terms', label: 'Terms of Service' },
				{ href: '/privacy', label: 'Privacy Policy' },
				{ href: '/guidelines', label: 'Community Guidelines' }
			]
		}
	];
</script>

<!-- Bottom padding below lg keeps the footer clear of the fixed mobile navigation bar. -->
<footer class="mt-16 border-t border-slate-200 bg-white pb-20 lg:pb-0">
	<div class="container-page grid gap-8 py-10 sm:grid-cols-[1.5fr_1fr_1fr]">
		<div class="flex flex-col gap-3">
			<Logo />
			<p class="max-w-xs text-sm text-slate-500">
				Buy • Sell • Near You. The verified local marketplace for Cagayan Province.
			</p>
		</div>
		{#each groups as group (group.title)}
			<nav aria-label={group.title}>
				<h2 class="text-xs font-semibold tracking-wider text-slate-900 uppercase">{group.title}</h2>
				<ul class="mt-3 flex flex-col gap-2 text-sm">
					{#each group.links as link (link.href)}
						<li>
							<a href={link.href} class="text-slate-500 transition hover:text-brand-700"
								>{link.label}</a
							>
						</li>
					{/each}
				</ul>
			</nav>
		{/each}
	</div>
	<div class="border-t border-slate-100">
		<p class="container-page py-4 text-xs text-slate-500">
			© {new Date().getFullYear()} BILIDITO · Made for Cagayan Province
		</p>
	</div>
</footer>
