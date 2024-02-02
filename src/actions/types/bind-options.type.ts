import { Path } from "dot-path-value";
import { AutomergeSvelteStoreInterface } from "../../automerge-svelte-store.type";

export type BindOptions<T extends Record<string, any>> = {
  store: AutomergeSvelteStoreInterface<T>;
  path: Path<T>;
  title?: string;
  manualSave?: boolean;
};
