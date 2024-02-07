import type { Patch } from "@automerge/automerge";
import { from } from "@automerge/automerge";
import { patch } from "@onsetsoftware/automerge-patcher";
import { AutomergeStore } from "@onsetsoftware/automerge-store";
import { get, writable } from "svelte/store";
import { beforeEach, describe, expect, test } from "vitest";
import { AutomergeDerivedStore } from "../src/automerge-derived-store";
import { AutomergeSvelteStore } from "../src/automerge-svelte-store";
import { documentData, type DocumentType } from "./data";

describe("root store", () => {
  let store: AutomergeStore<DocumentType>,
    rootStore: AutomergeSvelteStore<DocumentType>,
    derivedStore: AutomergeDerivedStore<DocumentType["object"], DocumentType>;

  beforeEach(() => {
    store = new AutomergeStore<DocumentType>("tests", from(documentData));
    rootStore = new AutomergeSvelteStore(store);

    derivedStore = new AutomergeDerivedStore(rootStore, (doc) => doc.object);
  });

  test("derived store contains the correct data", () => {
    expect(get(derivedStore)).toEqual(documentData.object);
  });

  test("derived stores can be changed", () => {
    derivedStore.change((doc) => {
      doc!.data = "hello there world";
    });

    expect(get(derivedStore)?.data).toEqual("hello there world");
    expect(get(rootStore).object?.data).toEqual("hello there world");
  });

  test("derived stores Text values can be updated", async () => {
    const p: Patch = {
      action: "del",
      path: ["text", "1"],
      length: 3,
    };
    derivedStore.change((doc) => {
      patch(doc, p);
    });

    await new Promise<void>((done) => {
      derivedStore.subscribe((doc) => {
        expect(doc?.text?.toString()).toEqual("ag");
        expect(get(rootStore)?.object?.text?.toString()).toEqual("ag");
        done();
      });
    });
  });

  test("derived stores can be locally changed", () => {
    new Promise<void>((done) => {
      let initialRun = true;
      derivedStore.subscribe((doc) => {
        if (initialRun) {
          expect(doc?.hello).toEqual("world");
          initialRun = false;
          return;
        }

        expect(doc?.hello).toEqual("there world");
        expect(rootStore.get()?.object?.hello).toEqual("world");
        done();
      });

      derivedStore.localChange((doc) => {
        doc!.hello = "there world";

        return doc;
      });
    });
  });

  test("changes to a derived store can be batched in transactions", () => {
    return new Promise((done: Function) => {
      let calls = 0;
      derivedStore.subscribe((doc) => {
        if (calls === 0) {
          expect({ ...doc }).toEqual(documentData.object);
          calls++;
          return;
        }
        expect({ ...doc }.hello).toEqual("hello there world looking good");
        done();
      });

      derivedStore.transaction(() => {
        derivedStore.change((doc) => {
          doc.hello = "hello there world";
        });

        derivedStore.change((doc) => {
          doc.hello += " looking good";
        });
      });
    });
  });

  test("a derived store can switch based on a single other stores", () => {
    const otherStore = writable("id-1");
    const derivedStore = new AutomergeDerivedStore(
      rootStore,
      (doc, other) => {
        return doc.people.entities[other];
      },
      otherStore,
    );

    expect(get(derivedStore)).toEqual(documentData.people.entities["id-1"]);

    otherStore.set("id-2");

    expect(get(derivedStore)).toEqual(documentData.people.entities["id-2"]);
  });

  test("a derived store can switch based on multiple other stores", () => {
    const otherStore = writable("id-1");
    const anotherStore = writable("name");
    const derivedStore = new AutomergeDerivedStore(
      rootStore,
      (doc, [other, another]) => {
        return doc.people.entities[other][another];
      },
      [otherStore, anotherStore],
    );

    expect(get(derivedStore)).toEqual(
      documentData.people.entities["id-1"]["name"],
    );

    otherStore.set("id-2");

    expect(get(derivedStore)).toEqual(
      documentData.people.entities["id-2"]["name"],
    );
  });

  test("a derived store can change based on other stores", () => {
    const otherStore = writable("id-1");
    const derivedStore = new AutomergeDerivedStore(
      rootStore,
      (doc, other) => {
        return doc.people.entities[other];
      },
      otherStore,
    );

    expect(get(derivedStore)).toEqual(documentData.people.entities["id-1"]);

    otherStore.set("id-2");

    derivedStore.change((doc) => {
      doc.name = "Alex";
    });

    expect(get(derivedStore).id).toEqual("id-2");
    expect(get(derivedStore).name).toEqual("Alex");
  });

  test("a derived store can locally change based on other stores", () => {
    const otherStore = writable("id-1");
    const derivedStore = new AutomergeDerivedStore(
      rootStore,
      (doc, other) => {
        return doc.people.entities[other];
      },
      otherStore,
    );

    expect(get(derivedStore)).toEqual(documentData.people.entities["id-1"]);

    otherStore.set("id-2");

    derivedStore.change((doc) => {
      doc.name = "Alex";
    });

    expect(get(derivedStore).id).toEqual("id-2");
    expect(get(derivedStore).name).toEqual("Alex");
  });
});
