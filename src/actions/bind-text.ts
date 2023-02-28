import type { AutomergeSvelteStore } from "../automerge-svelte-store.type";
import type { Path } from "dot-path-value";
import { getByPath } from "dot-path-value";
import { getTextPatches } from "../diff-to-patches";
import { patch } from "@onsetsoftware/automerge-patcher";

export function bindText<T extends Record<string, any>>(
  node: HTMLInputElement,
  {
    store,
    path,
    title,
  }: { store: AutomergeSvelteStore<T>; path: Path<T>; title?: string }
) {
  let lastValue: string;

  const subscription = store.subscribe((doc) => {
    node.value = lastValue = getByPath(doc, path).toString();
  });

  const inputListener = () => {
    const patches = getTextPatches(lastValue, node.value);

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

  return {
    destroy() {
      subscription();
      node.removeEventListener("input", inputListener);
    },
  };
}
