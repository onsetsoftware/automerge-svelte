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
      subscribe: (node, { store, ids, property, hide }) => {
        return store.subscribe((doc) => {
          if (!hide) {
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
      changeListener: (node, { store, ids, property, title }) => {
        store.change(
          (doc) => {
            const lastValue = doc.entities[ids[0]][property as keyof Extend<T>];
            const patches = getStringPatches(String(lastValue), node.value);

            patches.forEach((p) => {
              const path = p.path.slice();
              ids.forEach((id) => {
                p.path.unshift(...[property as string]);

                patch(doc.entities[id], p);
                p.path = path;
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
