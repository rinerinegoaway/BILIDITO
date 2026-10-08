<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import AuthCard from '#lib/components/layout/AuthCard.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);

	const registerHref = $derived(
		page.url.searchParams.get('redirectTo')
			? `/register?redirectTo=${encodeURIComponent(page.url.searchParams.get('redirectTo')!)}`
			: '/register'
	);
</script>

<svelte:head>
	<title>Log in · BILIDITO</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<AuthCard title="Log in" subtitle="Welcome back to your local marketplace.">
	<form
		method="post"
		class="flex flex-col gap-4"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update({ reset: false });
				submitting = false;
			};
		}}
	>
		{#if data.reset}
			<Alert tone="success">Your password was changed. Log in with your new password.</Alert>
		{/if}
		{#if form?.message}<Alert tone="error">{form.message}</Alert>{/if}

		<Input
			label="Email or username"
			name="identifier"
			autocomplete="username"
			autocapitalize="none"
			spellcheck={false}
			value={form?.values?.identifier ?? ''}
			error={form?.errors?.identifier}
			required
		/>
		<Input
			label="Password"
			name="password"
			type="password"
			autocomplete="current-password"
			error={form?.errors?.password}
			required
		/>
		<div class="-mt-1 text-right text-sm">
			<a href="/forgot-password" class="font-medium text-brand-700 hover:underline"
				>Forgot password?</a
			>
		</div>
		<Button type="submit" size="lg" fullWidth loading={submitting}>Log in</Button>
	</form>

	{#snippet footer()}
		New to BILIDITO? <a href={registerHref} class="font-semibold text-brand-700 hover:underline"
			>Create an account</a
		>
	{/snippet}
</AuthCard>
