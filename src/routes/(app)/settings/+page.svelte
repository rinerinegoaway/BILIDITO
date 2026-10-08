<script lang="ts">
	import { enhance } from '$app/forms';
	import LocationSelector from '#lib/components/marketplace/LocationSelector.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const a = $derived(data.account);

	// svelte-ignore state_referenced_locally
	let municipalityId = $state(data.account.municipalityId);
	// svelte-ignore state_referenced_locally
	let barangayId = $state(data.account.barangayId);
	let saving = $state<string | null>(null);

	const profileForm = $derived(form?.section === 'profile' ? form : null);
	const passwordForm = $derived(form?.section === 'password' ? form : null);

	const submit =
		(section: string, reset: boolean): SubmitFunction =>
		() => {
			saving = section;
			return async ({ update }) => {
				await update({ reset });
				saving = null;
			};
		};
</script>

<svelte:head>
	<title>Settings · BILIDITO</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container-page flex max-w-3xl flex-col gap-6 py-8">
	<h1 class="text-2xl font-bold text-slate-900">Settings</h1>

	<section class="card p-5 sm:p-6" aria-labelledby="profile-heading">
		<h2 id="profile-heading" class="text-lg font-semibold text-slate-900">Profile</h2>
		<form
			method="post"
			action="?/profile"
			class="mt-4 flex flex-col gap-4"
			use:enhance={submit('profile', false)}
		>
			{#if profileForm && 'saved' in profileForm}
				<Alert tone="success">Your profile was updated.</Alert>
			{/if}
			{#if profileForm && 'message' in profileForm && profileForm.message}
				<Alert tone="error">{profileForm.message}</Alert>
			{/if}
			<div class="grid gap-4 sm:grid-cols-2">
				<Input
					label="Full name"
					name="name"
					autocomplete="name"
					value={profileForm && 'values' in profileForm ? profileForm.values?.name : a.name}
					error={profileForm && 'errors' in profileForm ? profileForm.errors?.name : undefined}
					required
				/>
				<Input
					label="Mobile number"
					name="mobileNumber"
					type="tel"
					inputmode="tel"
					value={profileForm && 'values' in profileForm
						? profileForm.values?.mobileNumber
						: a.mobileNumber}
					error={profileForm && 'errors' in profileForm
						? profileForm.errors?.mobileNumber
						: undefined}
					hint="Never shown publicly"
					required
				/>
				<Input
					label="Username"
					name="username-readonly"
					value={a.username}
					disabled
					hint="Usernames can't be changed"
				/>
				<Input
					label="Email"
					name="email-readonly"
					value={a.email}
					disabled
					hint="Never shown publicly"
				/>
			</div>
			<LocationSelector
				provinceName={data.provinceName}
				municipalities={data.municipalities}
				bind:municipalityId
				bind:barangayId
				initialBarangays={data.barangays}
				errors={profileForm && 'errors' in profileForm ? profileForm.errors : {}}
			/>
			<div class="flex justify-end">
				<Button type="submit" loading={saving === 'profile'}>Save profile</Button>
			</div>
		</form>
	</section>

	<section class="card p-5 sm:p-6" aria-labelledby="password-heading">
		<h2 id="password-heading" class="text-lg font-semibold text-slate-900">Change password</h2>
		<form
			method="post"
			action="?/password"
			class="mt-4 flex flex-col gap-4"
			use:enhance={submit('password', true)}
		>
			{#if passwordForm && 'saved' in passwordForm}
				<Alert tone="success">Password changed. Other devices were signed out.</Alert>
			{/if}
			{#if passwordForm && 'message' in passwordForm && passwordForm.message}
				<Alert tone="error">{passwordForm.message}</Alert>
			{/if}
			<Input
				label="Current password"
				name="currentPassword"
				type="password"
				autocomplete="current-password"
				error={passwordForm && 'errors' in passwordForm
					? passwordForm.errors?.currentPassword
					: undefined}
				required
			/>
			<div class="grid gap-4 sm:grid-cols-2">
				<Input
					label="New password"
					name="password"
					type="password"
					autocomplete="new-password"
					hint="At least 8 characters"
					error={passwordForm && 'errors' in passwordForm
						? passwordForm.errors?.password
						: undefined}
					required
				/>
				<Input
					label="Confirm new password"
					name="confirmPassword"
					type="password"
					autocomplete="new-password"
					error={passwordForm && 'errors' in passwordForm
						? passwordForm.errors?.confirmPassword
						: undefined}
					required
				/>
			</div>
			<div class="flex justify-end">
				<Button type="submit" loading={saving === 'password'}>Change password</Button>
			</div>
		</form>
	</section>

	<section class="flex items-center justify-between card p-5 sm:p-6">
		<div>
			<h2 class="text-lg font-semibold text-slate-900">Log out</h2>
			<p class="text-sm text-slate-600">Sign out of BILIDITO on this device.</p>
		</div>
		<form method="post" action="/logout">
			<Button type="submit" variant="secondary">Log out</Button>
		</form>
	</section>
</div>
