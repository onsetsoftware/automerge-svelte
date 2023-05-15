import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";

export function bindEntityValueDeferred<
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
            ids.forEach((id) => {
              // @ts-ignore
              doc.entities[id][property] = node.value as T[typeof property];
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
