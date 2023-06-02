import { HasId } from "@onsetsoftware/entity-state";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";

export function bindEntityChecked<U, T extends HasId<T>>(
  node: HTMLInputElement,
  options: BindEntityOptions<U, T>,
) {
  return inputAction(
    {
      subscribe: (node, { store, property, ids }) => {
        return store.subscribe((doc) => {
          const values = new Set(ids.map((id) => doc.entities[id]?.[property]));

          if (values.size === 1) {
            node.checked = Boolean(doc.entities[ids[0]]?.[property]);
          } else {
            node.checked = false;
            node.indeterminate = true;
          }
        });
      },
      inputListener: (node, { store, ids, property, title }) => {
        store.change(
          (doc) => {
            ids.forEach((id) => {
              // @ts-ignore
              doc.entities[id][property] = node.checked;
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
