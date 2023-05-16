import { Unsubscriber } from "svelte/store";
import { FormControlElement } from "./types/input-elements.type";

type Actions<T, U extends FormControlElement = FormControlElement> = {
  subscribe: (node: U, options: T) => Unsubscriber;
  inputListener: (node: U, options: T) => void;
  changeListener?: (node: U, options: T) => void;
};

export const inputAction = <
  T,
  U extends FormControlElement = FormControlElement,
>(
  actions: Actions<T, U>,
  node: U,
  options: T,
) => {
  let unsubscribe: Unsubscriber;

  function subscribe() {
    return actions.subscribe(node, options);
  }

  unsubscribe = subscribe();

  const inputListener = () => {
    actions.inputListener(node, options);
  };

  node.addEventListener("input", inputListener);

  const changeListener = () => {
    if (actions.changeListener) {
      actions.changeListener(node, options);
    }
  };

  node.addEventListener("change", changeListener);

  return {
    update(value: T) {
      unsubscribe();
      options = value;
      unsubscribe = subscribe();
    },
    destroy() {
      unsubscribe();
      node.removeEventListener("input", inputListener);
      node.removeEventListener("change", changeListener);
    },
  };
};
