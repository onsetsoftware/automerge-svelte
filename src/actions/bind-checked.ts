import type { Extend } from "@automerge/automerge";
import type { Path, PathValue } from "dot-path-value";
import { getByPath, setByPath } from "dot-path-value";
import { inputAction } from "./input-action";
import { BindOptions } from "./types/bind-options.type";

export function bindChecked<T extends Record<string, any>>(
  node: HTMLInputElement,
  { store, path, title }: BindOptions<T>,
) {
  return inputAction<BindOptions<T>>(
    {
      subscribe: (node, { store, path }) => {
        return store.subscribe((doc) => {
          node.checked = getByPath(doc, path) as boolean;
        });
      },
      inputListener: (node, { store, path, title }) => {
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
      },
    },
    node,
    { store, path, title },
  );
}
