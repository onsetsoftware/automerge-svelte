import type { AutomergeSvelteStore } from "../automerge-svelte-store.type";
import type { Path, PathValue } from "dot-path-value";
import { getByPath, setByPath } from "dot-path-value";
import type { Extend } from "@automerge/automerge";

export function bindChecked<T extends Record<string, any>>(
  node: HTMLInputElement,
  {
    store,
    path,
    title,
  }: { store: AutomergeSvelteStore<T>; path: Path<T>; title?: string },
) {
  const subscription = store.subscribe((doc) => {
    node.checked = getByPath(doc, path) as boolean;
  });

  const inputListener = () => {
    store.change(
      (doc) => {
        setByPath(
          doc,
          path as Path<Extend<T>>,
          node.checked as PathValue<Extend<T>, Path<Extend<T>>>,
        );
      },
      title ? { message: `Update ${title}` } : {},
    );
  };

  node.addEventListener("input", inputListener);

  return {
    destroy() {
      subscription();
      node.removeEventListener("input", inputListener);
    },
  };
}
