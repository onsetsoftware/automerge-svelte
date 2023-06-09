import { HasId } from "@onsetsoftware/entity-state";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";
import { PathValue, getByPath, setByPath } from "dot-path-value";

export function bindEntityChecked<
  U,
  T extends HasId<T> & { [K in keyof T]: T[K] },
>(node: HTMLInputElement, options: BindEntityOptions<U, T>) {
  return inputAction(
    {
      subscribe: (node, { store, path, ids }) => {
        return store.subscribe((doc) => {
          const values = new Set(
            ids.map((id) => getByPath(doc.entities[id], path)),
          );

          if (values.size === 1) {
            node.checked = Boolean(getByPath(doc.entities[ids[0]], path));
          } else {
            node.checked = false;
            node.indeterminate = true;
          }
        });
      },
      inputListener: (node, { store, ids, path, title }) => {
        store.change(
          (doc) => {
            ids.forEach((id) => {
              setByPath(
                doc.entities[id],
                path,
                node.checked as PathValue<T, typeof path>,
              );
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
