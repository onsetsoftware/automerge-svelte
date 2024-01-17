import { Unsubscriber } from "svelte/store";
import { AutomergeSvelteInput } from "./types/automerge-svelte-input.type";
import { FormControlElement } from "./types/input-elements.type";

type Actions<
  T extends { manualSave?: boolean } & { [key: string]: any },
  U extends FormControlElement = FormControlElement,
> = {
  subscribe: (node: U, options: T) => Unsubscriber;
  inputListener: (node: U, options: T, reset?: boolean) => void;
  changeListener?: (node: U, options: T, forceWrite?: boolean) => void;
  onUpdate?: (node: U, previousOptions: T, newOptions: T) => void;
};

export const inputAction = <
  T extends { manualSave?: boolean } & { [key: string]: any },
  U extends FormControlElement = FormControlElement,
>(
  actions: Actions<T, U>,
  node: U,
  options: T,
) => {
  let unsubscribe: Unsubscriber;
  let changed = false;

  function dispatchUpdate(options: T, previousOptions: T) {
    const event = new CustomEvent<{ options: T; previousOptions: T }>(
      "update",
      {
        detail: { options, previousOptions },
      },
    );

    node.dispatchEvent(event);
  }

  function subscribe() {
    return actions.subscribe(node, options);
  }

  unsubscribe = subscribe();

  const inputListener = () => {
    changed = true;
    actions.inputListener(node, options);
  };

  node.addEventListener("input", inputListener);

  const changeListener = () => {
    if (changed && actions.changeListener) {
      dispatchUpdate(options, options);
      if (!options.manualSave) {
        actions.changeListener(node, options);
        changed = false;
      }
    }
  };

  node.addEventListener("change", changeListener);

  (node as AutomergeSvelteInput).reset = () => {
    actions.inputListener(node, options, true);
  };

  (node as AutomergeSvelteInput).save = () => {
    if (actions.changeListener) {
      actions.changeListener(node, options, true);
    }
  };

  return {
    update(newOptions: T) {
      if (changed === true) {
        dispatchUpdate(newOptions, options);
      }

      if (changed && actions.onUpdate) {
        actions.onUpdate(node, options, newOptions);
      }
      unsubscribe();
      options = newOptions;
      changed = false;
      unsubscribe = subscribe();
    },
    destroy() {
      unsubscribe();
      node.removeEventListener("input", inputListener);
      node.removeEventListener("change", changeListener);
    },
  };
};
