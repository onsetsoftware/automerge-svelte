import { Extend } from "@automerge/automerge";
import { patch } from "@onsetsoftware/automerge-patcher";
import type { Path } from "dot-path-value";
import { getByPath } from "dot-path-value";
import { getStringPatches } from "../diff-to-patches";
import { inputAction } from "./input-action";
import { BindOptions } from "./types/bind-options.type";
import { InputElement } from "./types/input-elements.type";

export function bindString<T extends Record<string, any>>(
  node: InputElement,
  options: BindOptions<T>,
) {
  return inputAction(
    {
      subscribe: (node, { store, path }) => {
        return store.subscribe((doc) => {
          node.value = getByPath(doc, path)?.toString() || "";
        });
      },
      inputListener: (node, { store, path, title }) => {
        store.change(
          (doc) => {
            const lastValue = getByPath(doc, path as Path<Extend<T>>);
            const patches = getStringPatches(String(lastValue), node.value);

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
    options,
  );
}
