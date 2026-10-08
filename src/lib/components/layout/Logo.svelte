<script lang="ts">
	let { compact = false }: { compact?: boolean } = $props();
</script>

<a href="/" class="inline-flex items-center gap-2 rounded-md" aria-label="BILIDITO home">
	<svg viewBox="0 0 32 32" class="size-8 shrink-0" aria-hidden="true">
		<rect width="32" height="32" rx="8" fill="#0B3D91" />
		<path
			d="M16 6.5c-4 0-7 3-7 6.9 0 5 7 12.1 7 12.1s7-7.1 7-12.1c0-3.9-3-6.9-7-6.9Z"
			fill="#fff"
		/>
		<path
			d="m12.6 13.6 2.4 2.4 4.4-4.6"
			fill="none"
			stroke="#10B981"
			stroke-width="2.4"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
	{#if !compact}
		<span class="text-lg font-extrabold tracking-tight text-brand-700">BILIDITO</span>
	{/if}
</a>
