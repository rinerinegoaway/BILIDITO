<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Label + control + hint/error wrapper. The control snippet receives the ids it must use so the
	 * label, hint and error are wired for screen readers.
	 */
	let {
		label,
		hint,
		error,
		required = false,
		id,
		control
	}: {
		label: string;
		hint?: string;
		error?: string | null;
		required?: boolean | null;
		id: string;
		control: Snippet<[{ id: string; describedBy: string | undefined; invalid: boolean }]>;
	} = $props();

	const describedBy = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);
</script>

<div class="flex flex-col gap-1.5">
	<label for={id} class="text-sm font-medium text-slate-800">
		{label}
		{#if required}<span class="text-red-600" aria-hidden="true">*</span>{/if}
	</label>
	{@render control({ id, describedBy, invalid: Boolean(error) })}
	{#if hint && !error}
		<p id="{id}-hint" class="text-xs text-slate-500">{hint}</p>
	{/if}
	{#if error}
		<p id="{id}-error" class="text-xs font-medium text-red-600">{error}</p>
	{/if}
</div>
