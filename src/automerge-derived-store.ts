import type { ChangeFn, ChangeOptions } from "@automerge/automerge";
import {
  Stores,
  StoresValues,
  derived,
  get,
  type Readable,
  type Updater,
} from "svelte/store";
import type { AutomergeSvelteStoreInterface } from "./automerge-svelte-store.type";

export class AutomergeDerivedStore<T, U, V extends Stores = []>
  implements Readable<T>, AutomergeSvelteStoreInterface<T>
{
  #rootStore: AutomergeSvelteStoreInterface<U>;
  #state: Readable<T>;

  #discriminator: (doc: U, stores: StoresValues<V>) => T;
  #update: (fn: Updater<T>) => void = () => {};

  #otherStores: Readable<any>[];

  constructor(
    rootStore: AutomergeSvelteStoreInterface<U>,
    fn: (doc: U, stores: StoresValues<V>) => T,
    otherStores: V = [] as unknown as V,
  ) {
    this.#rootStore = rootStore;
    this.#discriminator = fn;

    this.#otherStores = Array.isArray(otherStores)
      ? otherStores
      : [otherStores];

    this.#state = derived(
      [rootStore, ...this.#otherStores],
      (stores, set, update) => {
        const [$rootStore, ...$otherStores] = stores as [U, ...StoresValues<V>];
        this.#update = update;

        const value = fn($rootStore, $otherStores);

        set(value);
      },
    );
  }

  transaction(changes: () => void | string, message?: string) {
    this.#rootStore.transaction(changes, message);
  }

  get subscribe() {
    return this.#state.subscribe;
  }

  public change = (callback: ChangeFn<T>, options: ChangeOptions<T> = {}) => {
    const storeValues = this.#otherStores.map((store) => get(store));
    const changed = this.#rootStore.change(
      (doc) => {
        callback(this.#discriminator(doc as U, storeValues as StoresValues<V>));
      },
      options as unknown as ChangeOptions<U>,
    );
    return this.#discriminator(changed, storeValues as StoresValues<V>);
  };

  localChange(callback: Updater<T>) {
    this.#update((state: T) => {
      return callback({ ...state });
    });
  }

  get() {
    const storeValues = this.#otherStores.map((store) => get(store));

    return this.#discriminator(
      this.#rootStore.get() as U,
      storeValues as StoresValues<V>,
    );
  }
}
