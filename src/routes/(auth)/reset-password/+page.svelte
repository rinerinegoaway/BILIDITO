<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthCard from '#lib/components/layout/AuthCard.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Choose a new password · BILIDITO</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<AuthCard title="Choose a new password">
	{#if data.invalid}
		<Alert tone="error" title="This link is invalid or has expired">
			Reset links work once and expire after 1 hour.
		</Alert>
		<div class="mt-4">
			<Button href="/forgot-password" fullWidth>Request a new link</Button>
		</div>
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
			{#if form?.message}<Alert tone="error">{form.message}</Alert>{/if}
			<input type="hidden" name="token" value={data.token} />
			<Input
				label="New password"
				name="password"
				type="password"
				autocomplete="new-password"
				hint="At least 8 characters"
				error={form?.errors?.password}
				required
			/>
			<Input
				label="Confirm new password"
				name="confirmPassword"
				type="password"
				autocomplete="new-password"
				error={form?.errors?.confirmPassword}
				required
			/>
			<Button type="submit" size="lg" fullWidth loading={submitting}>Save new password</Button>
		</form>
	{/if}
</AuthCard>
