<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthCard from '#lib/components/layout/AuthCard.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Forgot password · BILIDITO</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<AuthCard title="Forgot your password?" subtitle="We'll email you a link to choose a new one.">
	{#if form && 'sent' in form && form.sent}
		<Alert tone="success" title="Check your email">
			If an account exists for <strong>{form.email}</strong>, a reset link is on its way. The link
			expires in 1 hour.
		</Alert>
	{:else}
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
			{#if form && 'message' in form && form.message}<Alert tone="error">{form.message}</Alert>{/if}
			<Input
				label="Email"
				name="email"
				type="email"
				autocomplete="email"
				value={form && 'values' in form ? (form.values?.email ?? '') : ''}
				error={form && 'errors' in form ? form.errors?.email : undefined}
				required
			/>
			<Button type="submit" size="lg" fullWidth loading={submitting}>Send reset link</Button>
		</form>
	{/if}

	{#snippet footer()}
		<a href="/login" class="font-semibold text-brand-700 hover:underline">Back to log in</a>
	{/snippet}
</AuthCard>
