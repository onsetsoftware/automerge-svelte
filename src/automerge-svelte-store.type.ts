import type { ChangeFn, ChangeOptions, Doc } from "@automerge/automerge";
import type { Readable, Updater } from "svelte/store";

export interface AutomergeSvelteStore<T> {
  subscribe: Readable<T>["subscribe"];

  change(callback: ChangeFn<T>, options?: ChangeOptions<T>): Doc<T>;

  localChange(callback: Updater<T>): void;

  get(): Doc<T> | null;
}
