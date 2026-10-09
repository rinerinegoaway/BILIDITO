<script lang="ts">
	/**
	 * Brand logo. `mark` (default): eagle-and-cart mark + wordmark, sized for the header.
	 * `full`: the complete logo with tagline, for hero/auth/footer use.
	 * Assets are generated from the master file by `bun scripts/build-brand-assets.ts`.
	 */
	let { variant = 'mark', class: className }: { variant?: 'mark' | 'full'; class?: string } =
		$props();
</script>

<a
	href="/"
	class={['inline-flex shrink-0 items-center gap-2 rounded-lg', className]}
	aria-label="BILIDITO home"
>
	{#if variant === 'full'}
		<img
			src="/brand/logo-full.webp"
			alt="BILIDITO: Buy, Sell, Near You"
			width="720"
			height="664"
			class="h-auto w-full"
			decoding="async"
		/>
	{:else}
		<img
			src="/brand/logo-mark.webp"
			alt=""
			width="214"
			height="160"
			class="h-10 w-auto"
			decoding="async"
		/>
		<!-- Below 360px only the mark fits next to the header icons. -->
		<span
			class="text-brand-gradient text-xl leading-none font-bold tracking-tight max-[359px]:sr-only"
			>BILIDITO</span
		>
	{/if}
</a>
