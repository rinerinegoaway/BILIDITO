<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Breadcrumbs from '#lib/components/ui/Breadcrumbs.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Modal from '#lib/components/ui/Modal.svelte';
	import Textarea from '#lib/components/ui/Textarea.svelte';
	import { formatMonthYear, timeAgo } from '#lib/domain/format.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const s = $derived(data.submission);
	let submitting = $state<'approve' | 'reject' | null>(null);
	let rejectOpen = $state(false);

	const status = $derived(
		s.status === 'VERIFIED'
			? { tone: 'success' as const, label: 'Approved' }
			: s.status === 'REJECTED'
				? { tone: 'danger' as const, label: 'Rejected' }
				: { tone: 'warning' as const, label: 'Pending review' }
	);

	// Re-open the reject dialog if the server returned a validation error for it.
	$effect(() => {
		if (form?.errors?.reason) rejectOpen = true;
	});

	const submit =
		(decision: 'approve' | 'reject'): SubmitFunction =>
		() => {
			submitting = decision;
			return async ({ update }) => {
				await update({ reset: false });
				submitting = null;
			};
		};
</script>

<svelte:head><title>Review ID · Admin · BILIDITO</title></svelte:head>

<Breadcrumbs
	items={[
		{ label: 'Admin', href: '/admin' },
		{ label: 'Verifications', href: '/admin/verifications' },
		{ label: s.user.name }
	]}
/>

<div class="flex flex-wrap items-center gap-3">
	<h1 class="page-title">{s.user.name}</h1>
	<Badge tone={status.tone}>{status.label}</Badge>
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-3">
	<section class="card p-5 lg:col-span-1" aria-labelledby="applicant">
		<h2 id="applicant" class="font-semibold text-slate-900">Applicant</h2>
		<dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
			<dt class="text-slate-500">Username</dt>
			<dd class="font-medium">@{s.user.username}</dd>
			<dt class="text-slate-500">Email</dt>
			<dd class="font-medium break-all">{s.user.email}</dd>
			<dt class="text-slate-500">Mobile</dt>
			<dd class="font-medium">{s.user.mobileNumber}</dd>
			<dt class="text-slate-500">Town</dt>
			<dd class="font-medium">{s.user.municipality}</dd>
			<dt class="text-slate-500">Member since</dt>
			<dd class="font-medium">{formatMonthYear(s.user.createdAt)}</dd>
			<dt class="text-slate-500">ID type</dt>
			<dd class="font-medium">{data.idTypeLabel}</dd>
			<dt class="text-slate-500">Submitted</dt>
			<dd class="font-medium">{timeAgo(s.createdAt)}</dd>
		</dl>
		<p class="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
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
							<a
								href="/admin/verifications/{s.id}/document/{doc.side}"
								target="_blank"
								rel="noreferrer"
								title="Open full size"
							>
								<img
									src="/admin/verifications/{s.id}/document/{doc.side}"
									alt="{doc.side} of submitted ID"
									class="aspect-[8/5] w-full bg-slate-100 object-contain"
									referrerpolicy="no-referrer"
								/>
							</a>
						{:else}
							<div
								class="flex aspect-[8/5] items-center justify-center bg-slate-50 text-sm text-slate-500"
							>
								Not provided
							</div>
						{/if}
						<figcaption class="px-4 py-2.5 text-xs font-semibold text-slate-600 capitalize">
							{doc.side} of ID
						</figcaption>
					</figure>
				{/each}
			</div>
		{/if}

		{#if s.status === 'PENDING'}
			<div class="flex flex-col gap-4 card p-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="font-semibold text-slate-900">Decision</h2>
					<p class="text-sm text-slate-500">The user is notified either way.</p>
				</div>
				{#if form?.message && !form?.errors?.reason}<Alert tone="error">{form.message}</Alert>{/if}
				<div class="flex flex-col-reverse gap-2 sm:flex-row">
					<Button
						variant="secondary"
						onclick={() => (rejectOpen = true)}
						disabled={submitting !== null}
					>
						<X class="size-4" aria-hidden="true" /> Reject…
					</Button>
					<form method="post" use:enhance={submit('approve')}>
						<input type="hidden" name="decision" value="approve" />
						<Button type="submit" variant="success" fullWidth loading={submitting === 'approve'}>
							<Check class="size-4" aria-hidden="true" /> Approve
						</Button>
					</form>
				</div>
			</div>
		{:else if s.status === 'REJECTED' && s.rejectionReason}
			<Alert tone="warning" title="Rejection reason sent to the user">{s.rejectionReason}</Alert>
		{/if}
	</section>
</div>

<Modal bind:open={rejectOpen} title="Reject this ID?">
	<form id="reject-form" method="post" class="flex flex-col gap-3" use:enhance={submit('reject')}>
		<input type="hidden" name="decision" value="reject" />
		<p class="text-sm text-slate-600">
			{s.user.name} will be asked to submit a new photo. Tell them what to fix.
		</p>
		<Textarea
			label="Reason"
			name="reason"
			rows={3}
			maxlength={500}
			placeholder="e.g. The photo is blurry. Please retake it in good light."
			value={form?.values?.reason ?? ''}
			error={form?.errors?.reason}
			required
		/>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (rejectOpen = false)}>Cancel</Button>
		<Button type="submit" form="reject-form" variant="danger" loading={submitting === 'reject'}>
			Reject ID
		</Button>
	{/snippet}
</Modal>
