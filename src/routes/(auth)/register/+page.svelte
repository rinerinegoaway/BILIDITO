<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthCard from '#lib/components/layout/AuthCard.svelte';
	import LocationSelector from '#lib/components/marketplace/LocationSelector.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);

	// svelte-ignore state_referenced_locally
	let municipalityId = $state(form?.values?.municipalityId ?? '');
	// svelte-ignore state_referenced_locally
	let barangayId = $state(form?.values?.barangayId ?? '');

	const v = $derived(form?.values ?? {});
	const e = $derived(form?.errors ?? {});
</script>

<svelte:head>
	<title>Create an account · BILIDITO</title>
	<meta
		name="description"
		content="Join BILIDITO, the verified local buy & sell marketplace for Cagayan."
	/>
</svelte:head>

<AuthCard
	wide
	title="Create your account"
	subtitle="One account lets you both buy and sell. You'll verify your ID in the next step."
>
	<form
		method="post"
		class="flex flex-col gap-4"
		novalidate
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update({ reset: false });
				submitting = false;
			};
		}}
	>
		{#if form?.message}<Alert tone="error">{form.message}</Alert>{/if}

		<div class="grid gap-4 sm:grid-cols-2">
			<Input
				label="Full name"
				name="name"
				autocomplete="name"
				value={v.name ?? ''}
				error={e.name}
				required
			/>
			<Input
				label="Username"
				name="username"
				autocomplete="username"
				autocapitalize="none"
				spellcheck={false}
				hint="Shown on your profile, e.g. juan_dc"
				value={v.username ?? ''}
				error={e.username}
				required
			/>
			<Input
				label="Email"
				name="email"
				type="email"
				autocomplete="email"
				hint="Never shown publicly"
				value={v.email ?? ''}
				error={e.email}
				required
			/>
			<Input
				label="Mobile number"
				name="mobileNumber"
				type="tel"
				inputmode="tel"
				autocomplete="tel"
				placeholder="0917 123 4567"
				hint="Never shown publicly"
				value={v.mobileNumber ?? ''}
				error={e.mobileNumber}
				required
			/>
			<Input
				label="Password"
				name="password"
				type="password"
				autocomplete="new-password"
				hint="At least 8 characters"
				error={e.password}
				required
			/>
			<Input
				label="Confirm password"
				name="confirmPassword"
				type="password"
				autocomplete="new-password"
				error={e.confirmPassword}
				required
			/>
		</div>

		<fieldset class="flex flex-col gap-2">
			<legend class="mb-2 text-sm font-semibold text-slate-900">Where are you based?</legend>
			<LocationSelector
				provinceName={data.provinceName}
				municipalities={data.municipalities}
				bind:municipalityId
				bind:barangayId
				initialBarangays={form?.barangays ?? []}
				errors={{ municipalityId: e.municipalityId, barangayId: e.barangayId }}
			/>
			<p class="text-xs text-slate-500">
				Only your town is shown publicly, never your exact address.
			</p>
		</fieldset>

		<div class="flex flex-col gap-1">
			<label class="flex items-start gap-3 text-sm text-slate-700">
				<input
					type="checkbox"
					name="agree"
					class="mt-0.5 size-5 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
					checked={v.agree === 'on'}
					aria-invalid={e.agree ? true : undefined}
				/>
				<span>
					I agree to the <a
						href="/terms"
						target="_blank"
						class="font-medium text-brand-700 underline">Terms of Service</a
					>,
					<a href="/privacy" target="_blank" class="font-medium text-brand-700 underline"
						>Privacy Policy</a
					>
					and
					<a href="/guidelines" target="_blank" class="font-medium text-brand-700 underline"
						>Community Guidelines</a
					>.
				</span>
			</label>
			{#if e.agree}<p class="text-xs font-medium text-red-600">{e.agree}</p>{/if}
		</div>

		<Button type="submit" size="lg" fullWidth loading={submitting}>Create account</Button>
	</form>

	{#snippet footer()}
		Already have an account? <a href="/login" class="font-semibold text-brand-700 hover:underline"
			>Log in</a
		>
	{/snippet}
</AuthCard>
