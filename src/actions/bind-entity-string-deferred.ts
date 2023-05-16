import { Extend } from "@automerge/automerge";
import { patch } from "@onsetsoftware/automerge-patcher";
import { getStringPatches } from "../diff-to-patches";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";

export function bindEntityStringDeferred<
  U,
  T extends { id: string; [key: string]: any },
>(node: HTMLInputElement, options: BindEntityOptions<U, T>) {
  return inputAction<BindEntityOptions<U, T>>(
    {
      subscribe: (node, { store, ids, property }) => {
        return store.subscribe((doc) => {
          const values = new Set(ids.map((id) => doc.entities[id]?.[property]));

          if (values.size === 1) {
            node.value = doc.entities[ids[0]]?.[property] || "";
          } else {
            node.value = "";
          }
        });
      },
      inputListener: (node, { store, ids, property }) => {
        store.localChange((doc) => {
          doc = quickClone(doc);
          ids.forEach((id) => {
            doc.entities[id][property] = node.value as T[typeof property];
          });
          return doc;
        });
      },
      changeListener: (node, options) => {
        const { store, ids, property, title } = options;

        store.change(
          (doc) => {
            ids.forEach((id) => {
              const lastValue =
                doc.entities[id][property as keyof Extend<T>] || "";
              const patches = getStringPatches(String(lastValue), node.value);
              patches.forEach((p) => {
                p.path.unshift(...[property as string]);
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
