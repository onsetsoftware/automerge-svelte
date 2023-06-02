import { HasId } from "@onsetsoftware/entity-state";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";
import { FormControlElement } from "./types/input-elements.type";

export function bindEntityValueDeferred<U, T extends HasId<T>>(
  node: FormControlElement,
  options: BindEntityOptions<U, T>,
) {
  return inputAction(
    {
      subscribe: (node, { store, ids, property }) => {
        return store.subscribe((doc) => {
          const values = new Set(ids.map((id) => doc.entities[id]?.[property]));

          if (values.size === 1) {
            node.value = (doc.entities[ids[0]]?.[property] as string) || "";
          } else {
            node.value = "";
          }
        });
      },
      inputListener: (node, { store, ids, property }) => {
        store.localChange((doc) => {
          doc = quickClone(doc);
          ids.forEach((id) => {
            doc.entities[id][property as keyof T] =
              node.value as T[typeof property];
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
