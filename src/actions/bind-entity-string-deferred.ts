import { Extend } from "@automerge/automerge";
import { patch } from "@onsetsoftware/automerge-patcher";
import { HasId } from "@onsetsoftware/entity-state";
import { getStringPatches } from "../diff-to-patches";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";
import { InputElement } from "./types/input-elements.type";

export function bindEntityStringDeferred<
  U,
  T extends HasId<T> & { [K in keyof T]: T[K] },
>(node: InputElement, options: BindEntityOptions<U, T>) {
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
      changeListener: (node, options) => {
        const { store, ids, property, title } = options;

        store.change(
          (doc) => {
            ids.forEach((id) => {
              const lastValue =
                // @ts-ignore
                doc.entities[id][property as keyof Extend<T>] || "";
              const patches = getStringPatches(String(lastValue), node.value);
              patches.forEach((p) => {
                p.path.unshift(...[property as string]);
                // @ts-ignore
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
