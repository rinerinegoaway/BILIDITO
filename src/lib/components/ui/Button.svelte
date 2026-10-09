<script lang="ts" module>
	export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'success';
	export type ButtonSize = 'sm' | 'md' | 'lg';

	const variants: Record<ButtonVariant, string> = {
		// Gradient fill for the main action on a page. Use one per view where possible.
		primary:
			'bg-brand-gradient text-white shadow-sm shadow-brand-900/15 hover:brightness-95 hover:shadow-md active:brightness-90',
		secondary:
			'border border-slate-300 bg-white text-slate-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800',
		soft: 'bg-accent-50 text-accent-800 ring-1 ring-accent-200 ring-inset hover:bg-accent-100',
		ghost: 'text-slate-700 hover:bg-slate-100',
		danger: 'bg-red-600 text-white shadow-sm hover:bg-brand-800',
		success: 'bg-success-700 text-white shadow-sm hover:bg-success-800'
	};

	// md/lg are at least 44px tall: comfortable touch targets (spec §51).
	const sizes: Record<ButtonSize, string> = {
		sm: 'h-9 rounded-lg px-3 text-sm',
		md: 'h-11 rounded-xl px-4 text-sm',
		lg: 'h-12 rounded-xl px-6 text-base'
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
		'inline-flex shrink-0 items-center justify-center gap-2 font-semibold whitespace-nowrap transition duration-150 select-none',
		'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
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
