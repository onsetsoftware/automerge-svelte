import { patch } from "@onsetsoftware/automerge-patcher";
import { HasId } from "@onsetsoftware/entity-state";
import { getStringPatches } from "../diff-to-patches";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindEntityOptions } from "./types/bind-entity-options.type";
import { InputElement } from "./types/input-elements.type";
import { PathValue, getByPath, setByPath } from "dot-path-value";
import { equalArrays } from "../helpers/equal-arrays";

export function bindEntityStringDeferred<
  U,
  T extends HasId<T> & { [K in keyof T]: T[K] },
>(node: InputElement, options: BindEntityOptions<U, T>) {
  let changed = false;
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
        changed = true;
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
      changeListener: (node, options, forceSave) => {
        const { store, ids, path, title, manualSave } = options;

        if (!changed || (manualSave && !forceSave)) {
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

        changed = false;
      },
      onUpdate: function (node, previousOptions, newOptions) {
        if (
          !equalArrays(previousOptions.ids, newOptions.ids) &&
          this.changeListener
        ) {
          this.changeListener(node, previousOptions);
        }
      },
    },
    node,
    options,
  );
}
