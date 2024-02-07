import { type Updater, type Writable } from "svelte/store";
import type { AutomergeSvelteStoreInterface } from "./automerge-svelte-store.type";

export class AutomergeWritableStore<T>
  implements Writable<T>, AutomergeSvelteStoreInterface<T>
{
  #rootStore: AutomergeSvelteStoreInterface<T>;

  constructor(rootStore: AutomergeSvelteStoreInterface<T>) {
    this.#rootStore = rootStore;
    if (typeof rootStore.get() !== "object") {
      throw new Error(
        "We cannot currently create writable store from string value",
      );
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
      if (
        doc !== null &&
        typeof doc === "object" &&
        typeof value === "object"
      ) {
        Object.assign(doc, value);
      }
    });
  }

  update(callback: Updater<T>) {
    const value = this.get();
    this.set(callback(value!));
  }
}
