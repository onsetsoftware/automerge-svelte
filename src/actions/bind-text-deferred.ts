import { Extend } from "@automerge/automerge";
import { patch } from "@onsetsoftware/automerge-patcher";
import type { Path, PathValue } from "dot-path-value";
import { getByPath, setByPath } from "dot-path-value";
import { getTextPatches } from "../diff-to-patches";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindOptions } from "./types/bind-options.type";

export function bindTextDeferred<T extends Record<string, any>>(
  node: HTMLInputElement,
  { store, path, title }: BindOptions<T>,
) {
  return inputAction<BindOptions<T>>(
    {
      subscribe: (node, { store, path }) => {
        return store.subscribe((doc) => {
          node.value = getByPath(doc, path)?.toString() || "";
        });
      },
      inputListener: (node, { store, path }) => {
        store.localChange((doc) => {
          doc = quickClone(doc);
          setByPath(doc, path, node.value as PathValue<T, Path<T>>);

          return doc;
        });
      },
      changeListener: (node, { store, path, title }) => {
        store.change(
          (doc) => {
            const lastValue = getByPath(doc, path as Path<Extend<T>>);
            const patches = getTextPatches(String(lastValue), node.value);

            patches.forEach((p) => {
              p.path.unshift(...path.split("."));
              patch(doc, p);
            });
          },
          title ? { message: `Update ${title}` } : {},
        );
      },
    },
    node,
    { store, path, title },
  );
}
