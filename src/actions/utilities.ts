import { EntityState, HasId } from "@onsetsoftware/entity-state";
import { BindEntityOptions } from "./types/bind-entity-options.type";
import { getByPath } from "dot-path-value";

export const getEntitiesValue = <
  U,
  T extends HasId<T> & { [K in keyof T]: T[K] },
>(
  doc: EntityState<T>,
  ids: BindEntityOptions<U, T>["ids"],
  path: BindEntityOptions<U, T>["path"],
) => {
  const values = new Set(ids.map((id) => getByPath(doc.entities[id], path)));

  if (values.size === 1) {
    return (getByPath(doc.entities[ids[0]], path) as string) || "";
  } else {
    return "";
  }
};
