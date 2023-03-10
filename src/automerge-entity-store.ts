import { AutomergeDerivedStore } from "./automerge-derived-store";
import type { EntityState } from "@onsetsoftware/mutable-js";
import {
  addEntities,
  addEntity,
  deleteEntity,
  updateEntity,
} from "@onsetsoftware/mutable-js";
import type { Doc } from "@automerge/automerge";
import type { AutomergeSvelteStore } from "./automerge-svelte-store";

type EntityTitles = {
  singular: string;
  plural: string;
};

export class AutomergeEntityStore<
  T extends { id: string },
  V extends EntityState<T> = EntityState<T>,
  U = Doc<unknown>
> extends AutomergeDerivedStore<V, U> {
  readonly #titles: EntityTitles | undefined;
  constructor(
    rootStore: AutomergeSvelteStore<U>,
    fn: (doc: U) => V,
    titles?: EntityTitles
  ) {
    super(rootStore, fn);
    this.#titles = titles;
  }

  public add(entity: T, message?: string) {
    this.change(
      (doc) => {
        addEntity(doc as EntityState<T>, entity);
      },
      {
        message:
          message || this.#titles ? `Add ${this.#titles!.singular}` : undefined,
      }
    );
  }

  addMany(entities: T[], message?: string) {
    this.change(
      (doc) => {
        addEntities(doc as EntityState<T>, entities);
      },
      {
        message:
          message || this.#titles
            ? `Add ${entities.length} ${entities.length > 1
              ? this.#titles!.plural
              : this.#titles!.singular
            }`
            : undefined,
      }
    );
  }

  update(entity: Partial<T> & Pick<T, "id">, message?: string) {
    this.change(
      (doc) => {
        updateEntity(doc as EntityState<T>, entity);
      },
      {
        message:
          message || this.#titles ? `Update ${this.#titles!.singular}` : undefined,
      }
    );
  }

  delete(id: string, message?: string) {
    this.change(
      (doc) => {
        deleteEntity(doc as EntityState<T>, id);
      },
      {
        message:
          message || this.#titles ? `Delete ${this.#titles!.singular}` : undefined,
      }
    );
  }
}
