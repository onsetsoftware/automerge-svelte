import type { ChangeFn, ChangeOptions, Doc } from "@automerge/automerge";
import type { AutomergeStore } from "@onsetsoftware/automerge-store";
import {
  derived, Subscriber, writable, type Readable,
  type Updater,
  type Writable
} from "svelte/store";
import type { AutomergeSvelteStore as AutomergeSvelteStoreType } from "./automerge-svelte-store.type";

export class AutomergeSvelteStore<T>
  implements Readable<T>, AutomergeSvelteStoreType<T>
{
  #store: AutomergeStore<T> | null;
  #state: Writable<T | null>;
  #storeReady: Writable<boolean> = writable(false);
  ready: Readable<boolean> = derived(this.#storeReady, (ready) => ready);

  #subscribers: number = 0;
  #unSubscriber: () => void = () => { };

  #unSubscribe: () => void = () => {
    this.#unSubscriber();
  };

  constructor(store?: AutomergeStore<T>) {
    this.#store = store || null;

    if (store) {
      this.setStoreReady();
    }

    this.#state = writable(store ? store.doc : null, () => {
      if (store) {
        this.setStore();
      }

      return this.#unSubscribe;
    });
  }

  get id() {
    return this.#store?.id;
  }

  get subscribe() {
    this.#subscribers++;

    return ((fn: Subscriber<T | null>) => {
      const subscription = this.#state.subscribe(fn);

      return () => {
        this.#subscribers--;
        subscription();
      };
    }) as AutomergeSvelteStoreType<T>["subscribe"];
  }

  swapStore(store: AutomergeStore<T>) {
    if (store) {
      this.#store = store;
      this.setStoreReady();
    } else {
      this.#state.set(null);
      this.#storeReady.set(false);
      this.#store = null;
    }

    if (this.#subscribers > 0) {
      this.#unSubscribe();

      this.setStore();
    }
  }

  private setStore() {
    this.#unSubscriber =
      this.#store?.subscribe((doc: Doc<T>) => {
        this.#state.set(doc);
      }) ?? (() => { });
  }

  private setStoreReady() {
    this.#storeReady.set(false);

    this.#store?.onReady(() => {
      this.#storeReady.set(true);
    });
  }

  change(callback: ChangeFn<T>, options: ChangeOptions<T> = {}): Doc<T> {
    return this.#store ? this.#store.change(callback, options) : {} as Doc<T>;
  }

  localChange(callback: Updater<T>) {
    this.#state.update((state: T | null) => {

      return state ? callback({ ...state }) : null;
    });
  }

  get() {
    return this.#store?.doc ?? null;
  }
}
