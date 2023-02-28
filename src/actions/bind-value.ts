import type { AutomergeSvelteStore } from "../automerge-svelte-store.type";
import type { Path, PathValue } from "dot-path-value";
import { getByPath } from "dot-path-value";
import { setByPath } from "../set-by-path";
import type { Extend } from "@automerge/automerge";

export function bindValue<T extends Record<string, any>>(
  node: HTMLInputElement,
  {
    store,
    path,
    title,
  }: { store: AutomergeSvelteStore<T>; path: Path<T>; title?: string }
) {
  const subscription = store.subscribe((doc) => {
    node.value = (getByPath(doc, path) as string) || "";
  });

  const inputListener = () => {
    store.change(
      (doc) => {
        setByPath(
          doc,
          path as Path<Extend<T>>,
          node.value as PathValue<Extend<T>, Path<Extend<T>>>
        );
      },
      title ? { message: `Update ${title}` } : {}
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
