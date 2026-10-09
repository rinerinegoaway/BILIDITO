<script lang="ts">
	type Size = 'sm' | 'md' | 'lg' | 'xl';

	let {
		name,
		src = null,
		size = 'md',
		class: className
	}: { name: string; src?: string | null; size?: Size; class?: string } = $props();

	const initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('')
	);
	const sizes: Record<Size, string> = {
		sm: 'size-8 text-xs',
		md: 'size-10 text-sm',
		lg: 'size-20 text-2xl',
		xl: 'size-24 text-3xl sm:size-28'
	};
</script>

{#if src}
	<img
		{src}
		alt=""
		class={[
			'shrink-0 rounded-full bg-slate-100 object-cover ring-2 ring-white',
			sizes[size],
			className
		]}
		loading="lazy"
		decoding="async"
	/>
{:else}
	<span
		class={[
			'inline-flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-100 to-accent-100 font-semibold text-brand-800 ring-2 ring-white',
			sizes[size],
			className
		]}
		aria-hidden="true"
	>
		{initials}
	</span>
{/if}
