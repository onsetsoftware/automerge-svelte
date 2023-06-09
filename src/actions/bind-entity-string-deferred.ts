import { patch } from "@onsetsoftware/automerge-patcher";
import { HasId } from "@onsetsoftware/entity-state";
import { getStringPatches } from "../diff-to-patches";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";
import { InputElement } from "./types/input-elements.type";
import { PathValue, getByPath, setByPath } from "dot-path-value";

export function bindEntityStringDeferred<
  U,
  T extends HasId<T> & { [K in keyof T]: T[K] },
>(node: InputElement, options: BindEntityOptions<U, T>) {
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
      changeListener: (node, options) => {
        const { store, ids, path, title } = options;

        store.change(
          (doc) => {
            ids.forEach((id) => {
              const lastValue =
                (getByPath(doc.entities[ids[0]], path) as string) || "";
              const patches = getStringPatches(String(lastValue), node.value);
              patches.forEach((p) => {
                p.path.unshift(...(path as string).split("."));
                patch(doc.entities[id], p);
              });
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
