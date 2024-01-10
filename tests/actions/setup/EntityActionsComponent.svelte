<script lang="ts">
	import type { DocumentShape, Person } from "./document.type";
	import {
		AutomergeEntityStore,
		bindEntityChecked,
		bindEntityIntDeferred,
		bindEntityStringDeferred,
		bindEntityValueDeferred,
	} from "../../../src";
	import { Writable, writable } from "svelte/store";

	export let ids: Writable<string[]> = writable(["1", "2"]);

	export let manualSave: boolean = false;

	export let store: AutomergeEntityStore<DocumentShape, Person>;
</script>

<label>
	<input
		type="checkbox"
		use:bindEntityChecked={{
			manualSave,
			store,
			ids: $ids,
			path: "loggedIn",
		}}
	/>
	checked
</label>

<label>
	Value Deferred Input
	<input
		type="string"
		use:bindEntityValueDeferred={{
			manualSave,
			store,
			ids: $ids,
			path: "name",
		}}
	/>
</label>

<label>
	Int Deferred Input
	<input
		type="number"
		use:bindEntityIntDeferred={{
			manualSave,
			store,
			ids: $ids,
			path: "age",
		}}
	/>
</label>

<label>
	String Deferred Input
	<input
		type="text"
		use:bindEntityStringDeferred={{
			manualSave,
			store,
			ids: $ids,
			path: "location",
		}}
	/>
</label>
