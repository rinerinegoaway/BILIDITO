<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';

	let { label = 'Verified', compact = false }: { label?: string; compact?: boolean } = $props();
</script>

<span
	class="inline-flex items-center gap-1 text-xs font-semibold text-success-700"
	title="This user's identity was verified by BILIDITO"
>
	<BadgeCheck class="size-4" aria-hidden="true" />
	{#if compact}<span class="sr-only">{label}</span>{:else}{label}{/if}
</span>
