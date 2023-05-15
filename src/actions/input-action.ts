import { Unsubscriber } from "svelte/store";

type Actions<T> = {
  subscribe: (node: HTMLInputElement, options: T) => Unsubscriber;
  inputListener: (node: HTMLInputElement, options: T) => void;
  changeListener?: (node: HTMLInputElement, options: T) => void;
};

export const inputAction = <T>(
  actions: Actions<T>,
  node: HTMLInputElement,
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
