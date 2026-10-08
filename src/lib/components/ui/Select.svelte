<script lang="ts" module>
	export interface SelectOption {
		value: string;
		label: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import Field from './Field.svelte';
	import { controlClass } from './styles.ts';

	type Props = {
		label: string;
		name: string;
		options: SelectOption[];
		placeholder?: string;
		hint?: string;
		error?: string | null;
		value?: string | null;
	} & Omit<HTMLSelectAttributes, 'value' | 'name'>;

	let {
		label,
		name,
		options,
		placeholder,
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
		<select
			{id}
			{name}
			{required}
			bind:value
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
			class={[controlClass(invalid), 'h-11 pr-10', className]}
			{...rest}
		>
			{#if placeholder}
				<option value="" disabled={required}>{placeholder}</option>
			{/if}
			{#each options as option (option.value)}
				<option value={option.value} disabled={option.disabled}>{option.label}</option>
			{/each}
		</select>
	{/snippet}
</Field>
