<script lang="ts">
	import { navigating } from '$app/state';

	// Thin top bar while a page loads, shown only if navigation takes longer than 150ms.
	let visible = $state(false);

	$effect(() => {
		if (!navigating.to) {
			visible = false;
			return;
		}
		const timer = setTimeout(() => (visible = true), 150);
		return () => clearTimeout(timer);
	});
</script>

{#if visible}
	<div
		class="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-brand-100"
		role="progressbar"
		aria-label="Loading page"
	>
		<div class="h-full w-1/3 animate-[progress_1.1s_ease-in-out_infinite] bg-brand-gradient"></div>
	</div>
{/if}

<style>
	@keyframes -global-progress {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(300%);
		}
	}
</style>
