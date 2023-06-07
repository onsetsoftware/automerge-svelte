import { GetIdType, HasId } from "@onsetsoftware/entity-state";
import { Path } from "dot-path-value";
import { AutomergeEntityStore } from "../../automerge-entity-store";

export type BindEntityOptions<
  U,
  T extends HasId<T> & { [K in keyof T]: T[K] },
> = {
  store: AutomergeEntityStore<U, T>;
  ids: GetIdType<T>[];
  path: Path<T>;
  title?: string;
};
