<script lang="ts" module>
	export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
	export type ButtonSize = 'sm' | 'md' | 'lg';

	const variants: Record<ButtonVariant, string> = {
		primary: 'bg-brand-700 text-white hover:bg-brand-800 disabled:bg-brand-300',
		accent: 'bg-accent-700 text-white hover:bg-accent-800 disabled:bg-accent-300',
		secondary:
			'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:text-slate-400',
		ghost: 'text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
		danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
	};

	// Minimum 44px touch target on md/lg (spec §51).
	const sizes: Record<ButtonSize, string> = {
		sm: 'h-9 px-3 text-sm',
		md: 'h-11 px-4 text-sm',
		lg: 'h-12 px-6 text-base'
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		variant?: ButtonVariant;
		size?: ButtonSize;
		/** Renders a link styled as a button. */
		href?: string;
		loading?: boolean;
		fullWidth?: boolean;
		children: Snippet;
	} & Omit<HTMLButtonAttributes, 'children'> &
		Omit<HTMLAnchorAttributes, 'children' | 'type'>;

	let {
		variant = 'primary',
		size = 'md',
		href,
		loading = false,
		fullWidth = false,
		type = 'button',
		disabled,
		class: className,
		children,
		...rest
	}: Props = $props();

	const classes = $derived([
		'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors select-none disabled:cursor-not-allowed',
		variants[variant],
		sizes[size],
		fullWidth && 'w-full',
		className
	]);
</script>

{#if href && !disabled}
	<a {href} class={classes} {...rest as HTMLAnchorAttributes}>
		{@render children()}
	</a>
{:else}
	<button
		{type}
		class={classes}
		disabled={disabled || loading}
		aria-busy={loading || undefined}
		{...rest as HTMLButtonAttributes}
	>
		{#if loading}
			<span
				class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
				aria-hidden="true"
			></span>
		{/if}
		{@render children()}
	</button>
{/if}
