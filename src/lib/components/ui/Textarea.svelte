<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import Field from './Field.svelte';
	import { controlClass } from './styles.ts';

	type Props = {
		label: string;
		name: string;
		hint?: string;
		error?: string | null;
		value?: string | null;
	} & Omit<HTMLTextareaAttributes, 'value' | 'name'>;

	let {
		label,
		name,
		hint,
		error,
		required = false,
		rows = 4,
		value = $bindable(),
		class: className,
		...rest
	}: Props = $props();

	const uid = $props.id();
</script>

<Field {label} {hint} {error} {required} id="{name}-{uid}">
	{#snippet control({ id, describedBy, invalid })}
		<textarea
			{id}
			{name}
			{required}
			{rows}
			bind:value
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
			class={[controlClass(invalid), 'py-2.5', className]}
			{...rest}></textarea>
	{/snippet}
</Field>
