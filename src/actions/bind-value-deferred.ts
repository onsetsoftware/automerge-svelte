import type { AutomergeSvelteStore } from "../automerge-svelte-store.type";
import type { Path, PathValue } from "dot-path-value";
import { getByPath } from "dot-path-value";
import { setByPath } from "../set-by-path";
import type { Extend } from "@automerge/automerge";
import { quickClone } from "../helpers/quick-clone";

export function bindValueDeferred<T extends Record<string, any>>(
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
    store.localChange((doc) => {
      doc = quickClone(doc);
      setByPath(doc, path, node.value as PathValue<T, Path<T>>);

      return doc;
    });
  };

  const changeListener = () => {
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
  node.addEventListener("change", changeListener);

  return {
    destroy() {
      subscription();
      node.removeEventListener("input", inputListener);
      node.removeEventListener("change", changeListener);
    },
  };
}
