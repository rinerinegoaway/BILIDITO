<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import Clock from '@lucide/svelte/icons/clock';
	import Lock from '@lucide/svelte/icons/lock';
	import { compressFormImages } from '#lib/client/compress-image.ts';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { timeAgo } from '#lib/domain/format.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);
	let frontPreview = $state<string | null>(null);
	let backPreview = $state<string | null>(null);

	function preview(e: Event, set: (url: string | null) => void) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		set(file ? URL.createObjectURL(file) : null);
	}

	const canSubmit = $derived(data.status === 'UNVERIFIED' || data.status === 'REJECTED');
	const fileInput =
		'block w-full text-sm text-slate-700 file:mr-3 file:h-11 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:font-semibold file:text-brand-800 hover:file:bg-brand-100';
</script>

<svelte:head>
	<title>Verify your account · BILIDITO</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container-page max-w-2xl py-8">
	<h1 class="text-2xl font-bold text-slate-900">Verify your account</h1>
	<p class="mt-1 text-slate-600">
		BILIDITO is a verified marketplace. Verified members get a <span
			class="font-semibold text-accent-700">✓ Verified</span
		> badge and can post listings and request to buy.
	</p>

	<div class="mt-6 flex flex-col gap-4">
		{#if data.welcome}
			<Alert tone="success" title="Welcome to BILIDITO!">
				Your account is ready. You can already browse and message sellers. Verify your ID below to
				start selling and buying.
			</Alert>
		{/if}

		{#if data.status === 'VERIFIED'}
			<div class="flex items-center gap-3 card p-5">
				<BadgeCheck class="size-8 text-accent-700" aria-hidden="true" />
				<div>
					<p class="font-semibold text-slate-900">You're verified</p>
					<p class="text-sm text-slate-600">You can post listings and request to buy.</p>
				</div>
			</div>
			<Button href="/items/create" variant="accent">Post your first listing</Button>
		{:else if data.status === 'PENDING'}
			<div class="flex items-start gap-3 card p-5">
				<Clock class="mt-0.5 size-6 text-amber-600" aria-hidden="true" />
				<div>
					<p class="font-semibold text-slate-900">Your ID is being reviewed</p>
					<p class="text-sm text-slate-600">
						Submitted {data.latest ? timeAgo(data.latest.createdAt) : 'recently'}. We'll send you a
						notification once an admin has checked it, usually within 1–2 days.
					</p>
				</div>
			</div>
		{/if}

		{#if canSubmit}
			{#if data.status === 'REJECTED' && data.latest?.rejectionReason}
				<Alert tone="warning" title="Your last submission wasn't approved">
					{data.latest.rejectionReason} Please submit a new, clear photo.
				</Alert>
			{/if}
			{#if form?.message}<Alert tone="error">{form.message}</Alert>{/if}

			<form
				method="post"
				enctype="multipart/form-data"
				class="flex flex-col gap-5 card p-5 sm:p-6"
				use:enhance={async ({ formData }) => {
					submitting = true;
					await compressFormImages(formData, ['front', 'back']);
					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
			>
				<Select
					label="Type of ID"
					name="idType"
					placeholder="Select your ID…"
					options={data.idTypes}
					value={form?.values?.idType ?? ''}
					error={form?.errors?.idType}
					required
				/>

				<div class="grid gap-5 sm:grid-cols-2">
					{#each [{ name: 'front', label: 'Front of ID', required: true, previewUrl: frontPreview, set: (u: string | null) => (frontPreview = u) }, { name: 'back', label: 'Back of ID (optional)', required: false, previewUrl: backPreview, set: (u: string | null) => (backPreview = u) }] as f (f.name)}
						<div class="flex flex-col gap-2">
							<label for="id-{f.name}" class="text-sm font-medium text-slate-800">
								{f.label}
								{#if f.required}<span class="text-red-600" aria-hidden="true">*</span>{/if}
							</label>
							<div
								class="flex aspect-[8/5] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50"
							>
								{#if f.previewUrl}
									<img
										src={f.previewUrl}
										alt="{f.label} preview"
										class="h-full w-full object-contain"
									/>
								{:else}
									<span class="px-4 text-center text-xs text-slate-500"
										>Clear photo, all corners visible, no glare</span
									>
								{/if}
							</div>
							<input
								id="id-{f.name}"
								type="file"
								name={f.name}
								accept="image/jpeg,image/png,image/webp"
								required={f.required}
								class={fileInput}
								aria-invalid={form?.errors?.[f.name] ? true : undefined}
								onchange={(e) => preview(e, f.set)}
							/>
							{#if form?.errors?.[f.name]}
								<p class="text-xs font-medium text-red-600">{form.errors[f.name]}</p>
							{/if}
						</div>
					{/each}
				</div>

				<div class="flex gap-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
					<Lock class="size-4 shrink-0 text-slate-500" aria-hidden="true" />
					<p>
						Your ID is stored privately and is only seen by BILIDITO administrators for
						verification. It is never shown to other users. Photo location data is removed when you
						upload. See our
						<a href="/privacy" class="underline">Privacy Policy</a>.
					</p>
				</div>

				<Button type="submit" size="lg" loading={submitting}>Submit for review</Button>
			</form>
		{/if}

		{#if page.url.searchParams.get('submitted') === '1' && data.status === 'PENDING'}
			<Alert tone="success">Thanks! Your ID was submitted for review.</Alert>
		{/if}
	</div>
</div>
