<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Community Guidelines · BILIDITO</title>
	<meta name="description" content="How to buy and sell safely and respectfully on BILIDITO." />
</svelte:head>

<h1>Community Guidelines</h1>
<p>BILIDITO works because neighbours trust each other. Help keep it that way.</p>

<h2>Be honest</h2>
<ul>
	<li>Use your real name and your own photos of the actual item.</li>
	<li>Describe the condition accurately, including defects.</li>
	<li>Don't post duplicate listings or bait-and-switch prices.</li>
</ul>

<h2>Be safe</h2>
<ul>
	<li>Meet in busy public places: malls, plazas, police-station lobbies.</li>
	<li>
		Don't share your home address in public. Share delivery details only through an accepted order.
	</li>
	<li>Inspect the item before you pay. BILIDITO never asks you to pay through the app.</li>
	<li>
		Be careful with anyone who rushes you, asks for advance payment, or wants to move to another
		app.
	</li>
</ul>

<h2>Be respectful</h2>
<p>
	No harassment, threats, hate speech or spam. Report anything that feels wrong; our team reviews
	every report.
</p>

<h2>Prohibited items</h2>
{#if data.prohibited.length}
	<ul>
		{#each data.prohibited as item (item.name)}
			<li>
				<strong>{item.name}</strong>{#if item.description}: {item.description}{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p>The list of prohibited items is being prepared.</p>
{/if}

<h2>Consequences</h2>
<p>
	Breaking these guidelines can lead to listing removal, a warning, suspension, or a permanent ban.
</p>
