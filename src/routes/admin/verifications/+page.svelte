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

<h1 class="text-2xl font-bold text-slate-900">ID verifications</h1>

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
		<table class="w-full text-left text-sm">
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
	{/if}
</div>
