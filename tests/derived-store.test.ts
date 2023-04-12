import { from } from "@automerge/automerge";
import type { Patch } from "@automerge/automerge-wasm";
import { patch } from "@onsetsoftware/automerge-patcher";
import { AutomergeStore } from "@onsetsoftware/automerge-store";
import { get } from "svelte/store";
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

  test("single value derived stores can be changed", () => {
    new Promise<void>((done) => {
      let initialRun = true;

      const singleValueStore = new AutomergeDerivedStore(
        rootStore,
        (doc) => doc.object?.hello,
      );
      singleValueStore.subscribe((hello) => {
        if (initialRun) {
          expect(hello).toEqual("world");
          initialRun = false;
          return;
        }

        expect(hello).toEqual("there world");
        done();
      });

      singleValueStore.localChange(() => {
        return "there world";
      });
    });
  });
});
