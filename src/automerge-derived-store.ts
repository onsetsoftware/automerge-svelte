import type { AutomergeSvelteStore } from "./automerge-svelte-store";
import type { ChangeFn, ChangeOptions } from "@automerge/automerge";
import {
  type Readable,
  type Updater,
  type Writable,
  writable,
} from "svelte/store";
import type { AutomergeSvelteStore as AutomergeSvelteStoreType } from "./automerge-svelte-store.type";

export class AutomergeDerivedStore<T, U>
  implements Readable<T>, AutomergeSvelteStoreType<T>
{
  #rootStore: AutomergeSvelteStore<U>;
  #state: Writable<T>;
  #discriminator: (doc: U) => T;

  constructor(rootStore: AutomergeSvelteStore<U>, fn: (doc: U) => T) {
    this.#rootStore = rootStore;
    this.#discriminator = fn;

    this.#state = writable(fn(rootStore.get() as U), () => {
      return this.#rootStore.subscribe((doc: U) => {
        this.#state.set(fn(doc));
      });
    });
  }

  transaction(changes: () => void, message?: string) {
    this.#rootStore.transaction(changes, message);
  }

  get subscribe() {
    return this.#state.subscribe;
  }

  public change = (callback: ChangeFn<T>, options: ChangeOptions<T> = {}) => {
    const changed = this.#rootStore.change((doc) => {
      callback(this.#discriminator(doc as U));
    }, options as unknown as ChangeOptions<U>);
    return this.#discriminator(changed);
  };

  localChange(callback: Updater<T>) {
    this.#state.update((state: T) => {
      return callback({ ...state });
    });
  }

  get() {
    return this.#discriminator(this.#rootStore.get() as U);
  }
}
