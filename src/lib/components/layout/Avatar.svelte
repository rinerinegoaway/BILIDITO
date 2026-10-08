<script lang="ts">
	let {
		name,
		src = null,
		size = 'md'
	}: { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg' } = $props();

	const initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('')
	);
	const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-20 text-2xl' };
</script>

{#if src}
	<img
		{src}
		alt=""
		class={['shrink-0 rounded-full object-cover', sizes[size]]}
		loading="lazy"
		decoding="async"
	/>
{:else}
	<span
		class={[
			'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800',
			sizes[size]
		]}
		aria-hidden="true"
	>
		{initials}
	</span>
{/if}
