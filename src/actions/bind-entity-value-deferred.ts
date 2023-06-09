import { HasId } from "@onsetsoftware/entity-state";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";
import { FormControlElement } from "./types/input-elements.type";
import { PathValue, getByPath, setByPath } from "dot-path-value";

export function bindEntityValueDeferred<
  U,
  T extends HasId<T> & { [K in keyof T]: T[K] },
>(node: FormControlElement, options: BindEntityOptions<U, T>) {
  return inputAction(
    {
      subscribe: (node, { store, ids, path }) => {
        return store.subscribe((doc) => {
          const values = new Set(
            ids.map((id) => getByPath(doc.entities[id], path)),
          );

          if (values.size === 1) {
            node.value =
              (getByPath(doc.entities[ids[0]], path) as string) || "";
          } else {
            node.value = "";
          }
        });
      },
      inputListener: (node, { store, ids, path }) => {
        store.localChange((doc) => {
          doc = quickClone(doc);
          ids.forEach((id) => {
            setByPath(
              doc.entities[id],
              path,
              node.value as PathValue<T, typeof path>,
            );
          });
          return doc;
        });
      },
      changeListener: (node, { store, ids, path, title }) => {
        store.change(
          (doc) => {
            ids.forEach((id) => {
              setByPath(
                doc.entities[id],
                path,
                node.value as PathValue<T, typeof path>,
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
