import type { EntityState } from "@onsetsoftware/mutable-js";

export function getEntity<T extends { id: string }>(
  state: EntityState<T>,
  id: string
): T {
  return state.entities[id];
}
