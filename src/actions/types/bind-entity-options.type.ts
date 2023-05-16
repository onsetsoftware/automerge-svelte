import { AutomergeEntityStore } from "../../automerge-entity-store";

export type BindEntityOptions<
  U,
  T extends { id: string; [key: string]: any },
> = {
  store: AutomergeEntityStore<U, T>;
  ids: string[];
  property: string;
  title?: string;
};
