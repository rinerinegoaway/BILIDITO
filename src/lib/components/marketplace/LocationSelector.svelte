<script lang="ts" module>
	export interface LocationChoice {
		id: string;
		name: string;
	}
</script>

<script lang="ts">
	import Select from '#lib/components/ui/Select.svelte';

	/**
	 * Province → Municipality/City → Barangay picker (spec §3). Barangays load on demand from
	 * /api/v1/locations/:id/barangays; the server re-validates the pair on submit.
	 */
	let {
		provinceName,
		municipalities,
		municipalityId = $bindable(''),
		barangayId = $bindable(''),
		initialBarangays = [],
		errors = {},
		required = true
	}: {
		provinceName: string;
		municipalities: LocationChoice[];
		municipalityId?: string;
		barangayId?: string;
		initialBarangays?: LocationChoice[];
		errors?: { municipalityId?: string; barangayId?: string };
		required?: boolean;
	} = $props();

	// Seeded once from the server-provided list; refreshed whenever the municipality changes.
	// svelte-ignore state_referenced_locally
	let barangays = $state<LocationChoice[]>(initialBarangays);
	// svelte-ignore state_referenced_locally
	let loadedFor = $state(initialBarangays.length ? municipalityId : '');
	let loading = $state(false);
	let loadError = $state<string | null>(null);

	async function loadBarangays(id: string) {
		if (!id || id === loadedFor) return;
		loading = true;
		loadError = null;
		try {
			const res = await fetch(`/api/v1/locations/${id}/barangays`);
			if (!res.ok) throw new Error(String(res.status));
			barangays = await res.json();
			loadedFor = id;
		} catch {
			barangays = [];
			loadError = 'Could not load barangays. Check your connection and try again.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void loadBarangays(municipalityId);
	});

	function onMunicipalityChange() {
		barangayId = '';
	}
</script>

<div class="grid gap-4 sm:grid-cols-3">
	<Select
		label="Province"
		name="province"
		options={[{ value: provinceName, label: provinceName }]}
		value={provinceName}
		disabled
		hint="More provinces coming soon"
	/>
	<Select
		label="Municipality / City"
		name="municipalityId"
		placeholder="Select…"
		options={municipalities.map((m) => ({ value: m.id, label: m.name }))}
		bind:value={municipalityId}
		onchange={onMunicipalityChange}
		error={errors.municipalityId}
		{required}
	/>
	<Select
		label="Barangay"
		name="barangayId"
		placeholder={loading ? 'Loading…' : municipalityId ? 'Select…' : 'Choose a town first'}
		options={barangays.map((b) => ({ value: b.id, label: b.name }))}
		bind:value={barangayId}
		disabled={!municipalityId || loading}
		error={errors.barangayId ?? loadError}
		{required}
	/>
</div>
