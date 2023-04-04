import type { AutomergeSvelteStore } from "../automerge-svelte-store.type";
import type { Path, PathValue } from "dot-path-value";
import { getByPath, setByPath } from "dot-path-value";
import { getTextPatches } from "../diff-to-patches";
import { patch } from "@onsetsoftware/automerge-patcher";
import { quickClone } from "../helpers/quick-clone";
import { Extend } from "@automerge/automerge";

export function bindTextDeferred<T extends Record<string, any>>(
  node: HTMLInputElement,
  {
    store,
    path,
    title,
  }: { store: AutomergeSvelteStore<T>; path: Path<T>; title?: string },
) {
  const subscription = store.subscribe((doc) => {
    node.value = getByPath(doc, path)?.toString();
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
        const lastValue = getByPath(doc, path as Path<Extend<T>>);
        const patches = getTextPatches(lastValue, node.value);

        patches.forEach((p) => {
          p.path.unshift(...path.split("."));
          patch(doc, p);
        });
      },
      title ? { message: `Update ${title}` } : {},
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
