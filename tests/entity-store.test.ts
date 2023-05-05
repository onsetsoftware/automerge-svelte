import { from } from "@automerge/automerge";
import { AutomergeStore } from "@onsetsoftware/automerge-store";
import { get } from "svelte/store";
import { beforeEach, describe, expect, test } from "vitest";
import { AutomergeEntityStore, AutomergeSvelteStore } from "../src";
import { documentData, DocumentType, Person } from "./data";

describe("Entity Store", () => {
  let store: AutomergeStore<DocumentType>,
    rootStore: AutomergeSvelteStore<DocumentType>,
    entityStore: AutomergeEntityStore<DocumentType, Person>;

  beforeEach(() => {
    store = new AutomergeStore<DocumentType>("tests", from(documentData));
    rootStore = new AutomergeSvelteStore(store);

    entityStore = new AutomergeEntityStore(rootStore, (doc) => doc.people);
  });

  test("derived store contains the correct data", () => {
    expect(get(entityStore)).toEqual(documentData.people);
  });

  test("can add an entity to the store", () => {
    const newPerson: Person = {
      id: "4",
      name: "John",
    };

    entityStore.add(newPerson);

    expect(get(entityStore)).toEqual({
      ids: [...documentData.people.ids, newPerson.id],
      entities: {
        ...documentData.people.entities,
        [newPerson.id]: newPerson,
      },
    });
  });
});
