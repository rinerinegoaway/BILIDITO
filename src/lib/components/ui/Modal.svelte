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
	class="m-0 mt-auto w-full max-w-none rounded-t-3xl bg-white p-0 shadow-lift backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-lg sm:rounded-2xl"
>
	<div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
		<h2 id={titleId} class="text-lg font-semibold text-slate-900">{title}</h2>
		<button
			type="button"
			class="-mr-2 inline-flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
			onclick={() => (open = false)}
			aria-label="Close"
		>
			<X class="size-5" />
		</button>
	</div>
	<div class="px-5 py-5">{@render children()}</div>
	{#if footer}
		<div
			class="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end [&_button]:w-full sm:[&_button]:w-auto [&_form]:w-full sm:[&_form]:w-auto"
		>
			{@render footer()}
		</div>
	{/if}
</dialog>
