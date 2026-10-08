<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Textarea from '#lib/components/ui/Textarea.svelte';
	import { formatMonthYear, timeAgo } from '#lib/domain/format.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const s = $derived(data.submission);
	let submitting = $state(false);

	const tone = $derived(
		s.status === 'VERIFIED' ? 'success' : s.status === 'REJECTED' ? 'danger' : 'warning'
	);
</script>

<svelte:head><title>Review ID · Admin · BILIDITO</title></svelte:head>

<a href="/admin/verifications" class="text-sm font-medium text-brand-700 hover:underline"
	>← All verifications</a
>

<div class="mt-3 flex flex-wrap items-center gap-3">
	<h1 class="text-2xl font-bold text-slate-900">{s.user.name}</h1>
	<Badge {tone}>{s.status}</Badge>
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-3">
	<section class="card p-5 lg:col-span-1" aria-labelledby="applicant">
		<h2 id="applicant" class="font-semibold text-slate-900">Applicant</h2>
		<dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
			<dt class="text-slate-500">Username</dt>
			<dd>@{s.user.username}</dd>
			<dt class="text-slate-500">Email</dt>
			<dd class="break-all">{s.user.email}</dd>
			<dt class="text-slate-500">Mobile</dt>
			<dd>{s.user.mobileNumber}</dd>
			<dt class="text-slate-500">Town</dt>
			<dd>{s.user.municipality}</dd>
			<dt class="text-slate-500">Member since</dt>
			<dd>{formatMonthYear(s.user.createdAt)}</dd>
			<dt class="text-slate-500">ID type</dt>
			<dd>{data.idTypeLabel}</dd>
			<dt class="text-slate-500">Submitted</dt>
			<dd>{timeAgo(s.createdAt)}</dd>
		</dl>
		<p class="mt-4 text-xs text-slate-500">
			Check that the name on the ID matches the account name and the photo is clear and unedited.
			Every view of these images is recorded in the audit log.
		</p>
	</section>

	<section class="flex flex-col gap-4 lg:col-span-2" aria-label="ID images">
		{#if s.documentsPurgedAt}
			<Alert tone="info">The ID images were deleted under the retention policy.</Alert>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2">
				{#each [{ side: 'front', show: s.hasFront }, { side: 'back', show: s.hasBack }] as doc (doc.side)}
					<figure class="overflow-hidden card">
						{#if doc.show}
							<img
								src="/admin/verifications/{s.id}/document/{doc.side}"
								alt="{doc.side} of submitted ID"
								class="aspect-[8/5] w-full bg-slate-100 object-contain"
								referrerpolicy="no-referrer"
							/>
						{:else}
							<div
								class="flex aspect-[8/5] items-center justify-center bg-slate-50 text-sm text-slate-500"
							>
								Not provided
							</div>
						{/if}
						<figcaption class="px-3 py-2 text-xs font-medium text-slate-600 capitalize">
							{doc.side}
						</figcaption>
					</figure>
				{/each}
			</div>
		{/if}

		{#if s.status === 'PENDING'}
			<form
				method="post"
				class="flex flex-col gap-4 card p-5"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
			>
				{#if form?.message}<Alert tone="error">{form.message}</Alert>{/if}
				<Textarea
					label="Reason (required to reject; sent to the user)"
					name="reason"
					rows={2}
					maxlength={500}
					placeholder="e.g. The photo is blurry. Please retake it in good light."
					value={form?.values?.reason ?? ''}
					error={form?.errors?.reason}
				/>
				<div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
					<Button type="submit" name="decision" value="reject" variant="danger" loading={submitting}
						>Reject</Button
					>
					<Button
						type="submit"
						name="decision"
						value="approve"
						variant="accent"
						loading={submitting}>Approve</Button
					>
				</div>
			</form>
		{:else if s.status === 'REJECTED' && s.rejectionReason}
			<Alert tone="warning" title="Rejected">{s.rejectionReason}</Alert>
		{/if}
	</section>
</div>
