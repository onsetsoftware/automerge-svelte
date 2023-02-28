import type { AutomergeSvelteStore } from "../automerge-svelte-store.type";
import type { Path, PathValue } from "dot-path-value";
import { getByPath } from "dot-path-value";
import { setByPath } from "../set-by-path";
import { getTextPatches } from "../diff-to-patches";
import { patch } from "@onsetsoftware/automerge-patcher";
import { quickClone } from "../helpers/quick-clone";

export function bindTextDeferred<T extends Record<string, any>>(
  node: HTMLInputElement,
  {
    store,
    path,
    title,
  }: { store: AutomergeSvelteStore<T>; path: Path<T>; title?: string }
) {
  const subscription = store.subscribe((doc) => {
    node.value = getByPath(doc, path).toString();
  });

  let lastValue: string = node.value;

  const inputListener = () => {
    store.localChange((doc) => {
      doc = quickClone(doc);
      setByPath(doc, path, node.value as PathValue<T, Path<T>>);

      return doc;
    });
  };

  const changeListener = () => {
    const patches = getTextPatches(lastValue, node.value);

    lastValue = node.value;
    store.change(
      (doc) => {
        patches.forEach((p) => {
          p.path.unshift(...path.split("."));
          patch(doc, p);
        });
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
