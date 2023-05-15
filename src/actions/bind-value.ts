import type { Extend } from "@automerge/automerge";
import type { Path, PathValue } from "dot-path-value";
import { getByPath, setByPath } from "dot-path-value";
import { inputAction } from "./input-action";
import { BindOptions } from "./types/bind-options.type";

export function bindValue<T extends Record<string, any>>(
  node: HTMLInputElement,
  options: BindOptions<T>,
) {
  return inputAction<BindOptions<T>>(
    {
      subscribe: (node, { store, path }) => {
        return store.subscribe((doc) => {
          node.value = (getByPath(doc, path) as string) || "";
        });
      },
      inputListener: (node, { store, path, title }) => {
        store.change(
          (doc) => {
            setByPath(
              doc,
              path as Path<Extend<T>>,
              node.value as PathValue<Extend<T>, Path<Extend<T>>>,
            );
          },
          title ? { message: `Update ${title}` } : {},
        );
      },
    },
    node,
    options,
  );
}
