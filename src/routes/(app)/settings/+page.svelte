<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import Camera from '@lucide/svelte/icons/camera';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import UserRound from '@lucide/svelte/icons/user-round';
	import { compressImage } from '#lib/client/compress-image.ts';
	import { CONNECTION_ERROR, isConnectionError } from '#lib/client/forms.ts';
	import Avatar from '#lib/components/layout/Avatar.svelte';
	import LocationSelector from '#lib/components/marketplace/LocationSelector.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Breadcrumbs from '#lib/components/ui/Breadcrumbs.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import Modal from '#lib/components/ui/Modal.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type FormState = {
		section?: string;
		saved?: boolean;
		message?: string;
		errors?: Partial<Record<string, string>>;
		values?: Record<string, string>;
	} | null;
	const f = $derived(form as FormState);
	const forSection = (name: string) => (f?.section === name ? f : null);

	const a = $derived(data.account);

	// ── Personal information (bound, so we can detect unsaved changes) ──
	// svelte-ignore state_referenced_locally
	let name = $state(data.account.name);
	// svelte-ignore state_referenced_locally
	let mobileNumber = $state(data.account.mobileNumber);
	// svelte-ignore state_referenced_locally
	let municipalityId = $state(data.account.municipalityId);
	// svelte-ignore state_referenced_locally
	let barangayId = $state(data.account.barangayId);

	const dirty = $derived(
		name !== a.name ||
			mobileNumber !== a.mobileNumber ||
			municipalityId !== a.municipalityId ||
			barangayId !== a.barangayId
	);

	function cancelEdits() {
		name = a.name;
		mobileNumber = a.mobileNumber;
		municipalityId = a.municipalityId;
		barangayId = a.barangayId;
	}

	beforeNavigate(({ cancel, willUnload }) => {
		if (!dirty && !photoPreview) return;
		if (willUnload) {
			cancel(); // browser shows its own "Leave site?" prompt
		} else if (!confirm('You have unsaved changes. Leave this page and discard them?')) {
			cancel();
		}
	});

	// ── Profile photo ──
	let photoInput: HTMLInputElement | undefined = $state();
	let photoPreview = $state<string | null>(null);
	let confirmRemove = $state(false);

	function onPhotoChosen(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (photoPreview) URL.revokeObjectURL(photoPreview);
		photoPreview = file ? URL.createObjectURL(file) : null;
	}

	function cancelPhoto() {
		if (photoPreview) URL.revokeObjectURL(photoPreview);
		photoPreview = null;
		if (photoInput) photoInput.value = '';
	}

	// ── Submission state ──
	let saving = $state<string | null>(null);
	let connectionError = $state<string | null>(null);

	const submit =
		(sectionName: string, opts: { reset?: boolean; compress?: string } = {}): SubmitFunction =>
		async ({ formData }) => {
			saving = sectionName;
			connectionError = null;
			if (opts.compress) {
				const file = formData.get(opts.compress);
				if (file instanceof File && file.size > 0) {
					formData.set(opts.compress, await compressImage(file, 800));
				}
			}
			return async ({ result, update }) => {
				if (isConnectionError(result)) {
					connectionError = sectionName;
					saving = null;
					return;
				}
				await update({ reset: opts.reset ?? false });
				saving = null;
				// The server normalises values (e.g. mobile → +63…), so adopt what was saved.
				if (result.type === 'success' && sectionName === 'profile') cancelEdits();
				if (result.type === 'success' && sectionName === 'avatar') {
					cancelPhoto();
					confirmRemove = false;
				}
			};
		};

	const sections = [
		{ id: 'photo', label: 'Profile photo', icon: Camera },
		{ id: 'personal', label: 'Personal information', icon: UserRound },
		{ id: 'password', label: 'Password', icon: KeyRound },
		{ id: 'session', label: 'Log out', icon: LogOut }
	];
</script>

<svelte:head>
	<title>Account settings · BILIDITO</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container-page py-6 sm:py-8">
	<Breadcrumbs
		items={[{ label: 'My profile', href: `/profile/${a.username}` }, { label: 'Account settings' }]}
	/>
	<h1 class="page-title">Account settings</h1>
	<p class="page-subtitle">Update your photo, personal details and password.</p>

	<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[14rem_1fr] lg:gap-8">
		<!-- Section navigation: sticky sidebar on desktop, scrollable chips on smaller screens. -->
		<nav aria-label="Settings sections" class="min-w-0 lg:sticky lg:top-24 lg:self-start">
			<ul class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
				{#each sections as s (s.id)}
					<li class="shrink-0">
						<a
							href="#{s.id}"
							class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700 lg:border-transparent lg:bg-transparent lg:hover:bg-white"
						>
							<s.icon class="size-4 text-slate-400" aria-hidden="true" />
							{s.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="flex min-w-0 flex-col gap-6">
			<!-- Profile photo -->
			<section id="photo" class="scroll-mt-24 card p-5 sm:p-6" aria-labelledby="photo-heading">
				<h2 id="photo-heading" class="text-lg font-semibold text-slate-900">Profile photo</h2>
				<p class="mt-1 text-sm text-slate-500">
					A clear photo of your face helps buyers and sellers trust you. JPG, PNG or WebP, up to 10
					MB.
				</p>

				{#if connectionError === 'avatar'}<Alert tone="error">{CONNECTION_ERROR}</Alert>{/if}
				{#if forSection('avatar')?.saved}
					<div class="mt-4"><Alert tone="success">Your profile photo was updated.</Alert></div>
				{/if}
				{#if forSection('avatar')?.message || forSection('avatar')?.errors?.avatar}
					<div class="mt-4">
						<Alert tone="error">
							{forSection('avatar')?.message ?? forSection('avatar')?.errors?.avatar}
						</Alert>
					</div>
				{/if}

				<div class="mt-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
					{#if photoPreview}
						<img
							src={photoPreview}
							alt="Preview of your new profile"
							class="size-24 rounded-full object-cover ring-4 ring-brand-100 sm:size-28"
						/>
					{:else}
						<Avatar name={a.name} src={a.image} size="xl" />
					{/if}

					<form
						method="post"
						action="?/avatar"
						enctype="multipart/form-data"
						class="flex flex-wrap items-center gap-2"
						use:enhance={submit('avatar', { compress: 'avatar' })}
					>
						<input
							bind:this={photoInput}
							id="avatar-input"
							type="file"
							name="avatar"
							accept="image/jpeg,image/png,image/webp"
							class="sr-only"
							onchange={onPhotoChosen}
						/>
						{#if photoPreview}
							<Button type="submit" loading={saving === 'avatar'}>Save photo</Button>
							<Button variant="ghost" onclick={cancelPhoto} disabled={saving === 'avatar'}>
								Cancel
							</Button>
						{:else}
							<Button variant="secondary" onclick={() => photoInput?.click()}>
								<Camera class="size-4" aria-hidden="true" />
								{a.image ? 'Change photo' : 'Upload photo'}
							</Button>
							{#if a.image}
								<Button variant="ghost" onclick={() => (confirmRemove = true)}>
									<Trash2 class="size-4" aria-hidden="true" /> Remove
								</Button>
							{/if}
						{/if}
					</form>
				</div>
			</section>

			<!-- Personal information -->
			<section
				id="personal"
				class="scroll-mt-24 card p-5 sm:p-6"
				aria-labelledby="personal-heading"
			>
				<h2 id="personal-heading" class="text-lg font-semibold text-slate-900">
					Personal information
				</h2>
				<p class="mt-1 text-sm text-slate-500">
					Your email and mobile number are private. Only your name and town appear on your profile.
				</p>

				<form
					method="post"
					action="?/profile"
					class="mt-5 flex flex-col gap-5"
					novalidate
					use:enhance={submit('profile')}
				>
					{#if connectionError === 'profile'}<Alert tone="error">{CONNECTION_ERROR}</Alert>{/if}
					{#if forSection('profile')?.saved && !dirty}
						<Alert tone="success">Your changes were saved.</Alert>
					{/if}
					{#if forSection('profile')?.message}
						<Alert tone="error">{forSection('profile')?.message}</Alert>
					{/if}

					<div class="grid gap-4 sm:grid-cols-2">
						<Input
							label="Full name"
							name="name"
							autocomplete="name"
							bind:value={name}
							error={forSection('profile')?.errors?.name}
							required
						/>
						<Input
							label="Mobile number"
							name="mobileNumber"
							type="tel"
							inputmode="tel"
							autocomplete="tel"
							placeholder="0917 123 4567"
							bind:value={mobileNumber}
							error={forSection('profile')?.errors?.mobileNumber}
							hint="Private. Never shown on your profile."
							required
						/>
						<Input
							label="Username"
							name="username-readonly"
							value="@{a.username}"
							disabled
							hint="Usernames can't be changed."
						/>
						<Input
							label="Email"
							name="email-readonly"
							value={a.email}
							disabled
							hint="Private. Contact support to change it."
						/>
					</div>

					<LocationSelector
						provinceName={data.provinceName}
						municipalities={data.municipalities}
						bind:municipalityId
						bind:barangayId
						initialBarangays={data.barangays}
						errors={forSection('profile')?.errors ?? {}}
					/>

					<div
						class="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end"
					>
						{#if dirty}
							<p class="mr-auto text-sm text-slate-500" role="status">You have unsaved changes.</p>
						{/if}
						<Button variant="ghost" onclick={cancelEdits} disabled={!dirty || saving === 'profile'}>
							Cancel
						</Button>
						<Button type="submit" disabled={!dirty} loading={saving === 'profile'}>
							Save changes
						</Button>
					</div>
				</form>
			</section>

			<!-- Password -->
			<section
				id="password"
				class="scroll-mt-24 card p-5 sm:p-6"
				aria-labelledby="password-heading"
			>
				<h2 id="password-heading" class="text-lg font-semibold text-slate-900">Change password</h2>
				<p class="mt-1 text-sm text-slate-500">
					Changing your password signs you out on your other devices.
				</p>
				<form
					method="post"
					action="?/password"
					class="mt-5 flex flex-col gap-4"
					use:enhance={submit('password', { reset: true })}
				>
					{#if connectionError === 'password'}<Alert tone="error">{CONNECTION_ERROR}</Alert>{/if}
					{#if forSection('password')?.saved}
						<Alert tone="success">Password changed. Your other devices were signed out.</Alert>
					{/if}
					{#if forSection('password')?.message}
						<Alert tone="error">{forSection('password')?.message}</Alert>
					{/if}
					<Input
						label="Current password"
						name="currentPassword"
						type="password"
						autocomplete="current-password"
						error={forSection('password')?.errors?.currentPassword}
						required
					/>
					<div class="grid gap-4 sm:grid-cols-2">
						<Input
							label="New password"
							name="password"
							type="password"
							autocomplete="new-password"
							hint="At least 8 characters"
							error={forSection('password')?.errors?.password}
							required
						/>
						<Input
							label="Confirm new password"
							name="confirmPassword"
							type="password"
							autocomplete="new-password"
							error={forSection('password')?.errors?.confirmPassword}
							required
						/>
					</div>
					<div class="flex justify-end border-t border-slate-100 pt-5">
						<Button type="submit" loading={saving === 'password'}>Update password</Button>
					</div>
				</form>
			</section>

			<!-- Session -->
			<section
				id="session"
				class="flex scroll-mt-24 flex-col gap-4 card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
			>
				<div>
					<h2 class="text-lg font-semibold text-slate-900">Log out</h2>
					<p class="mt-1 text-sm text-slate-500">Sign out of BILIDITO on this device.</p>
				</div>
				<form method="post" action="/logout">
					<Button type="submit" variant="secondary">
						<LogOut class="size-4" aria-hidden="true" /> Log out
					</Button>
				</form>
			</section>
		</div>
	</div>
</div>

<Modal bind:open={confirmRemove} title="Remove profile photo?">
	<p class="text-sm text-slate-600">
		Your initials will be shown instead. You can upload a new photo at any time.
	</p>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (confirmRemove = false)}>Keep photo</Button>
		<form method="post" action="?/removeAvatar" use:enhance={submit('avatar')}>
			<Button type="submit" variant="danger" loading={saving === 'avatar'}>Remove photo</Button>
		</form>
	{/snippet}
</Modal>
