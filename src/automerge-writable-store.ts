import { type Updater, type Writable } from "svelte/store";
import type { AutomergeSvelteStoreInterface } from "./automerge-svelte-store.type";
import { diff } from "just-diff";
import { diffApply } from "just-diff-apply";
import { quickClone } from "./helpers/quick-clone";

export class AutomergeWritableStore<T extends object>
  implements Writable<T>, AutomergeSvelteStoreInterface<T>
{
  #rootStore: AutomergeSvelteStoreInterface<T>;

  constructor(rootStore: AutomergeSvelteStoreInterface<T>) {
    this.#rootStore = rootStore;
    if (typeof rootStore.get() !== "object") {
      throw new Error("Writable stores must point to an object or array");
    }
  }

  get transaction() {
    return this.#rootStore.transaction;
  }

  get subscribe() {
    return this.#rootStore.subscribe;
  }

  get change() {
    return this.#rootStore.change;
  }

  get localChange() {
    return this.#rootStore.localChange;
  }

  get() {
    return this.#rootStore.get();
  }

  set(value: T) {
    this.#rootStore.change((doc) => {
      const patches = diff(quickClone(doc), value);

      diffApply(doc, patches);
    });
  }

  update(callback: Updater<T>) {
    const value = this.get();
    this.set(callback(value!));
  }
}
