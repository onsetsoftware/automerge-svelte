<script lang="ts">
	import type { DocumentShape } from "./document.type";
	import {
		AutomergeSvelteStore,
		bindChecked,
		bindString,
		bindStringDeferred,
		bindValue,
		bindValueDeferred,
	} from "../../../src";

	export let manualSave: boolean = false;

	export let store: AutomergeSvelteStore<DocumentShape>;
</script>

<label>
	<input
		type="checkbox"
		use:bindChecked={{
			store,
			path: "checked",
		}}
	/>
	checked
</label>
<label>
	Value Input
	<input
		type="text"
		use:bindValue={{
			store,
			path: "data.value",
		}}
	/>
</label>
<label>
	String Input
	<input
		type="text"
		use:bindString={{
			store,
			path: "data.value",
		}}
	/>
</label>
<label>
	Value Deferred Input
	<input
		type="text"
		use:bindValueDeferred={{
			manualSave,
			store,
			path: "data.value",
		}}
	/>
</label>
<label>
	String Deferred Input
	<input
		type="text"
		use:bindStringDeferred={{
			manualSave,
			store,
			path: "data.value",
		}}
	/>
</label>
