import { Path } from "dot-path-value";
import { AutomergeSvelteStore } from "../../automerge-svelte-store";

export type BindOptions<T extends Record<string, any>> = {
  store: AutomergeSvelteStore<T>;
  path: Path<T>;
  title?: string;
};
