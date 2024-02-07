import type { Patch } from "@automerge/automerge";
import { from } from "@automerge/automerge";
import { patch } from "@onsetsoftware/automerge-patcher";
import { AutomergeStore } from "@onsetsoftware/automerge-store";
import { get } from "svelte/store";
import { beforeEach, describe, expect, test } from "vitest";
import { AutomergeDerivedStore } from "../src/automerge-derived-store";
import { AutomergeSvelteStore } from "../src/automerge-svelte-store";
import { AutomergeWritableStore } from "../src/automerge-writable-store";
import { documentData, type DocumentType } from "./data";
import { AutomergeSvelteStoreInterface } from "../src";

describe("writable store", () => {
  let store: AutomergeStore<DocumentType>,
    rootStore: AutomergeSvelteStore<DocumentType>,
    derivedStore: AutomergeDerivedStore<DocumentType["array"], DocumentType>,
    writableStore: AutomergeWritableStore<DocumentType["array"]>;

  beforeEach(() => {
    store = new AutomergeStore<DocumentType>("tests", from(documentData));
    rootStore = new AutomergeSvelteStore(store);

    derivedStore = new AutomergeDerivedStore(rootStore, (doc) => doc.array);
    writableStore = new AutomergeWritableStore(derivedStore);
  });

  test("writable store contains the correct data", () => {
    expect(get(writableStore)).toEqual(documentData.array);
  });

  test("writable stores can be changed", () => {
    derivedStore.change((doc) => {
      doc.push("hello there world");
    });

    expect(get(writableStore)).toEqual(["hello", "world", "hello there world"]);
    expect(get(rootStore).array).toEqual([
      "hello",
      "world",
      "hello there world",
    ]);
  });

  test("writable stores can be locally changed", () => {
    new Promise<void>((done) => {
      let initialRun = true;
      writableStore.subscribe((doc) => {
        if (initialRun) {
          expect(doc[1]).toEqual("world");
          initialRun = false;
          return;
        }

        expect(doc[1]).toEqual("there world");
        expect(rootStore.get()?.array[1]).toEqual("world");
        done();
      });

      derivedStore.localChange((doc) => {
        doc[1] = "there world";

        return doc;
      });
    });
  });

  test("writable stores can be set", () => {
    writableStore.set(["hello", "world", "hello there world"]);

    expect(get(writableStore)).toEqual(["hello", "world", "hello there world"]);
    expect(get(rootStore).array).toEqual([
      "hello",
      "world",
      "hello there world",
    ]);
  });

  test("writable stores can be updated", () => {
    writableStore.update((doc) => {
      return [...doc, "hello there world"];
    });

    expect(get(writableStore)).toEqual(["hello", "world", "hello there world"]);
    expect(get(rootStore).array).toEqual([
      "hello",
      "world",
      "hello there world",
    ]);

    writableStore.update((doc) => {
      return doc.filter((item) => item !== "world");
    });

    expect(get(writableStore)).toEqual(["hello", "hello there world"]);

    writableStore.update((doc) => {
      return [...doc, "world"];
    });

    expect(get(writableStore)).toEqual(["hello", "hello there world", "world"]);

    writableStore.update((doc) => {
      return doc.filter((item) => item !== "world");
    });

    expect(get(writableStore)).toEqual(["hello", "hello there world"]);
  });

  test("writable non object stores throw an error", () => {
    const derivedStringStore = new AutomergeDerivedStore(
      rootStore,
      (doc) => doc.string,
    );

    expect(() => {
      new AutomergeWritableStore(
        derivedStringStore as unknown as AutomergeSvelteStoreInterface<any>,
      );
    }).toThrow();
  });
});
