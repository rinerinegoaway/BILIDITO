<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';

	/** Native <dialog>: focus trapping, Esc to close and inert background come from the browser. */
	let {
		open = $bindable(false),
		title,
		children,
		footer
	}: { open?: boolean; title: string; children: Snippet; footer?: Snippet } = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	const titleId = $props.id();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	aria-labelledby={titleId}
	onclose={() => (open = false)}
	onclick={(e) => e.target === dialog && (open = false)}
	class="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
>
	<div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
		<h2 id={titleId} class="text-base font-semibold text-slate-900">{title}</h2>
		<button
			type="button"
			class="rounded-md p-2 text-slate-500 hover:bg-slate-100"
			onclick={() => (open = false)}
			aria-label="Close"
		>
			<X class="size-5" />
		</button>
	</div>
	<div class="px-4 py-4">{@render children()}</div>
	{#if footer}
		<div class="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">{@render footer()}</div>
	{/if}
</dialog>
