import { patch } from "@onsetsoftware/automerge-patcher";
import { HasId } from "@onsetsoftware/entity-state";
import { PathValue, getByPath, setByPath } from "dot-path-value";
import { getStringPatches } from "../diff-to-patches";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";
import { InputElement } from "./types/input-elements.type";
import { getEntitiesValue } from "./utilities";

export function bindEntityStringDeferred<
  U,
  T extends HasId<T> & { [K in keyof T]: T[K] },
>(node: InputElement, options: BindEntityOptions<U, T>) {
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
      changeListener: (node, options, forceSave) => {
        const { store, ids, path, title, manualSave } = options;

        if (manualSave && !forceSave) {
          return;
        }

        store.change(
          (doc) => {
            ids.forEach((id) => {
              const value = getByPath(doc.entities[id], path);
              if (value === null || value === undefined) {
                setByPath(
                  doc.entities[id],
                  path,
                  node.value as PathValue<T, typeof path>,
                );
                return;
              }
              const lastValue = (value as string) || "";
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
