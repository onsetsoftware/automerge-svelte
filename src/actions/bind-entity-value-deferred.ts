import { HasId } from "@onsetsoftware/entity-state";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";
import { FormControlElement } from "./types/input-elements.type";
import { PathValue, getByPath, setByPath } from "dot-path-value";
import { getEntitiesValue } from "./utilities";

export function bindEntityValueDeferred<
  U,
  T extends HasId<T> & { [K in keyof T]: T[K] },
>(node: FormControlElement, options: BindEntityOptions<U, T>) {
  return inputAction(
    {
      subscribe: (node, { store, ids, path }) => {
        return store.subscribe((doc) => {
          node.value = getEntitiesValue(doc, ids, path);
        });
      },
      inputListener: (node, { store, ids, path }, reset) => {
        const value = reset
          ? getEntitiesValue(store.get(), ids, path)
          : node.value;

        store.localChange((doc) => {
          doc = quickClone(doc);
          ids.forEach((id) => {
            setByPath(
              doc.entities[id],
              path,
              value as PathValue<T, typeof path>,
            );
          });
          return doc;
        });
      },
      changeListener: (
        node,
        { store, ids, path, title, manualSave },
        forceSave,
      ) => {
        if (manualSave && !forceSave) {
          return;
        }

        store.change(
          (doc) => {
            ids.forEach((id) => {
              const value = getByPath(doc.entities[id], path);
              if (node.value !== value) {
                setByPath(
                  doc.entities[id],
                  path,
                  node.value as PathValue<T, typeof path>,
                );
              }
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
