import { Unsubscriber } from "svelte/store";
import { FormControlElement } from "./types/input-elements.type";
import { AutomergeSvelteInput } from "./types/automerge-svelte-input.type";

type Actions<T, U extends FormControlElement = FormControlElement> = {
  subscribe: (node: U, options: T) => Unsubscriber;
  inputListener: (node: U, options: T) => void;
  changeListener?: (node: U, options: T, forceWrite?: boolean) => void;
  onUpdate?: (node: U, previousOptions: T, newOptions: T) => void;
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

  (node as AutomergeSvelteInput).save = () => {
    if (actions.changeListener) {
      actions.changeListener(node, options, true);
    }
  };

  return {
    update(newOptions: T) {
      if (actions.onUpdate) {
        actions.onUpdate(node, options, newOptions);
      }
      unsubscribe();
      options = newOptions;
      unsubscribe = subscribe();
    },
    destroy() {
      unsubscribe();
      node.removeEventListener("input", inputListener);
      node.removeEventListener("change", changeListener);
    },
  };
};
