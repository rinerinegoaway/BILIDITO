<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Field from './Field.svelte';
	import { controlClass } from './styles.ts';

	type Props = {
		label: string;
		name: string;
		hint?: string;
		error?: string | null;
		value?: string | number | null;
	} & Omit<HTMLInputAttributes, 'value' | 'name'>;

	let {
		label,
		name,
		hint,
		error,
		required = false,
		value = $bindable(),
		class: className,
		...rest
	}: Props = $props();

	const uid = $props.id();
</script>

<Field {label} {hint} {error} {required} id="{name}-{uid}">
	{#snippet control({ id, describedBy, invalid })}
		<!-- text-base (16px) prevents iOS zoom on focus -->
		<input
			{id}
			{name}
			{required}
			bind:value
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
			class={[controlClass(invalid), 'h-11', className]}
			{...rest}
		/>
	{/snippet}
</Field>
