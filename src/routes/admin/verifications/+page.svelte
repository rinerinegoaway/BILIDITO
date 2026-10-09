<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { timeAgo } from '#lib/domain/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const tabs = [
		{ value: 'PENDING', label: 'Pending' },
		{ value: 'VERIFIED', label: 'Approved' },
		{ value: 'REJECTED', label: 'Rejected' }
	];
</script>

<svelte:head><title>Verifications · Admin · BILIDITO</title></svelte:head>

<h1 class="page-title">ID verifications</h1>
<p class="page-subtitle">Review government IDs so members can sell and buy.</p>

<nav class="mt-4 flex gap-2" aria-label="Filter by status">
	{#each tabs as tab (tab.value)}
		<a
			href="?status={tab.value}"
			class={[
				'rounded-full px-3 py-1.5 text-sm font-medium ring-1',
				data.status === tab.value
					? 'bg-brand-50 text-brand-800 ring-brand-300'
					: 'text-slate-600 ring-slate-200 hover:bg-slate-50'
			]}
			aria-current={data.status === tab.value ? 'page' : undefined}>{tab.label}</a
		>
	{/each}
</nav>

<div class="mt-4 overflow-x-auto card">
	{#if data.rows.length === 0}
		<EmptyState
			icon={ShieldCheck}
			title={data.status === 'PENDING' ? 'No pending verifications' : 'Nothing here yet'}
			description={data.status === 'PENDING' ? 'New ID submissions will appear here.' : undefined}
		/>
	{:else}
		<table class="hidden w-full text-left text-sm md:table">
			<thead class="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
				<tr>
					<th class="px-4 py-3 font-semibold">User</th>
					<th class="px-4 py-3 font-semibold">ID type</th>
					<th class="px-4 py-3 font-semibold">Municipality</th>
					<th class="px-4 py-3 font-semibold">Submitted</th>
					<th class="px-4 py-3"><span class="sr-only">Actions</span></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each data.rows as row (row.id)}
					<tr>
						<td class="px-4 py-3">
							<p class="font-medium text-slate-900">{row.name}</p>
							<p class="text-xs text-slate-500">@{row.username}</p>
						</td>
						<td class="px-4 py-3 text-slate-700">{row.idTypeLabel}</td>
						<td class="px-4 py-3 text-slate-700">{row.municipality}</td>
						<td class="px-4 py-3 whitespace-nowrap text-slate-700">{timeAgo(row.createdAt)}</td>
						<td class="px-4 py-3 text-right">
							<a
								href="/admin/verifications/{row.id}"
								class="font-semibold whitespace-nowrap text-brand-700 hover:underline"
								>{row.status === 'PENDING' ? 'Review' : 'View'} →</a
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<!-- Phones: one card per submission instead of a wide table. -->
		<ul class="divide-y divide-slate-100 md:hidden">
			{#each data.rows as row (row.id)}
				<li>
					<a
						href="/admin/verifications/{row.id}"
						class="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-slate-50"
					>
						<div class="min-w-0">
							<p class="truncate font-medium text-slate-900">{row.name}</p>
							<p class="truncate text-xs text-slate-500">@{row.username} · {row.municipality}</p>
							<p class="mt-0.5 text-xs text-slate-500">
								{row.idTypeLabel} · {timeAgo(row.createdAt)}
							</p>
						</div>
						<span class="shrink-0 text-sm font-semibold text-brand-700"
							>{row.status === 'PENDING' ? 'Review' : 'View'} →</span
						>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
