<script lang="ts">
	import Inbox from '@lucide/svelte/icons/inbox';
	import type { Component, Snippet } from 'svelte';

	let {
		title,
		description,
		icon: Icon = Inbox,
		action
	}: {
		title: string;
		description?: string;
		icon?: Component<{ class?: string }>;
		action?: Snippet;
	} = $props();
</script>

<div class="flex flex-col items-center gap-3 px-4 py-12 text-center">
	<div class="rounded-2xl bg-brand-50 p-3.5 text-brand-600">
		<Icon class="size-6" />
	</div>
	<h2 class="text-base font-semibold text-slate-900">{title}</h2>
	{#if description}<p class="max-w-sm text-sm text-slate-600">{description}</p>{/if}
	{#if action}<div class="mt-2">{@render action()}</div>{/if}
</div>
