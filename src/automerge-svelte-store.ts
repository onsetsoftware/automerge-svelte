import type { ChangeFn, ChangeOptions, Doc } from "@automerge/automerge";
import type {
  AutomergeStore,
  UndoRedo,
  PatchData,
} from "@onsetsoftware/automerge-store";
import {
  derived,
  Subscriber,
  writable,
  type Readable,
  type Updater,
  type Writable,
  readable,
} from "svelte/store";
import type { AutomergeSvelteStoreInterface } from "./automerge-svelte-store.type";

export class AutomergeSvelteStore<T>
  implements Readable<T>, AutomergeSvelteStoreInterface<T>
{
  #store: AutomergeStore<T> | null;
  #state: Writable<T | null>;
  #storeReady: Writable<boolean> = writable(false);
  ready: Readable<boolean> = derived(this.#storeReady, (ready) => ready);

  #subscribers: number = 0;
  #unSubscriber: () => void = () => {};

  #unSubscribe: () => void = () => {
    this.#unSubscriber();
  };

  constructor(store?: AutomergeStore<T>) {
    this.#store = store || null;

    this.#state = writable(store?.isReady ? store.doc : null, () => {
      if (store?.isReady) {
        this.setStore();
      }

      return this.#unSubscribe;
    });

    store?.onReady(() => {
      this.setStoreReady();
    });
  }

  get patches() {
    return readable<PatchData<T>>(
      {
        patches: [],
        patchInfo: {
          before: {} as Doc<T>,
          after: {} as Doc<T>,
          source: "change",
        },
      },
      (set) => {
        const unsubscribe =
          this.#store?.subscribe((_, patchData) => {
            set(patchData);
          }) || (() => {});

        return () => {
          unsubscribe();
        };
      },
    );
  }

  get id() {
    return this.#store?.id;
  }

  get doc() {
    return this.#store?.doc ?? null;
  }

  get subscribe() {
    this.#subscribers++;

    return ((fn: Subscriber<T | null>) => {
      const subscription = this.#state.subscribe(fn);

      return () => {
        this.#subscribers--;
        subscription();
      };
    }) as AutomergeSvelteStoreInterface<T>["subscribe"];
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
      }) ?? (() => {});
  }

  private setStoreReady() {
    this.#storeReady.set(false);

    this.#store?.onReady(() => {
      this.#storeReady.set(true);
    });
  }

  change(callback: ChangeFn<T>, options: ChangeOptions<T> = {}): Doc<T> {
    return this.#store ? this.#store.change(callback, options) : ({} as Doc<T>);
  }

  localChange(callback: Updater<T>) {
    this.#state.update((state: T | null) => {
      return state ? callback({ ...state }) : null;
    });
  }

  transaction(changes: () => void | string, message?: string) {
    this.#store?.transaction(changes, message);
  }

  pushUndoRedo(undoRedo: UndoRedo) {
    this.#store?.pushUndoRedo(undoRedo);
  }

  undo() {
    this.#store?.undo();
  }

  redo() {
    this.#store?.redo();
  }

  get() {
    return this.#store?.doc ?? null;
  }
}
