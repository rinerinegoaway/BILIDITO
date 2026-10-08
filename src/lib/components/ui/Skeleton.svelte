<script lang="ts">
	let { class: className }: { class?: string } = $props();
</script>

<div class={['animate-pulse rounded-md bg-slate-200', className]} aria-hidden="true"></div>
