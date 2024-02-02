import { getByPath, Path, PathValue, setByPath } from "dot-path-value";
import { quickClone } from "../helpers/quick-clone";
import { inputAction } from "./input-action";
import { BindOptions } from "./types/bind-options.type";
import { FormControlElement } from "./types/input-elements.type";

export function bindValueDeferred<T extends Record<string, any>>(
  node: FormControlElement,
  options: BindOptions<T>,
) {
  return inputAction(
    {
      subscribe: (node, { store, path }) => {
        return store.subscribe((doc) => {
          node.value = getByPath(doc, path)?.toString() || "";
        });
      },
      inputListener: (node, { store, path }, reset) => {
        const doc = store.get();
        const value = reset && doc ? getByPath(doc, path) : node.value;

        store.localChange((doc) => {
          doc = quickClone(doc);
          setByPath(doc, path, value as PathValue<T, Path<T>>);

          return doc;
        });
      },
      changeListener: (node, { store, path, title, manualSave }, forceSave) => {
        if (manualSave && !forceSave) {
          return;
        }

        store.change(
          (doc) => {
            setByPath(doc, path, node.value as PathValue<T, Path<T>>);
          },
          title ? { message: `Update ${title}` } : {},
        );
      },
    },
    node,
    options,
  );
}
