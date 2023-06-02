import type {
  EntityState,
  GetIdType,
  HasId,
} from "@onsetsoftware/entity-state";

export function getEntity<T extends HasId<T>>(
  state: EntityState<T>,
  id: GetIdType<T>,
): T {
  return state.entities[id];
}
