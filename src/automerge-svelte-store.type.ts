import type { ChangeFn, ChangeOptions, Doc } from "@automerge/automerge";
import type { Readable, Updater } from "svelte/store";

export interface AutomergeSvelteStoreInterface<T> {
  subscribe: Readable<T>["subscribe"];

  change(callback: ChangeFn<T>, options?: ChangeOptions<T>): Doc<T>;

  localChange(callback: Updater<T>): void;

  get(): Doc<T> | null;

  transaction(changes: () => void | string, message?: string): void;
}
