import { beforeEach, describe, expect, test } from "vitest";
import {
  AutomergeRepoStore,
  AutomergeStore,
} from "@onsetsoftware/automerge-store";
import { documentData, type DocumentType } from "./data";
import { from } from "@automerge/automerge";
import { AutomergeSvelteStore } from "../src/automerge-svelte-store";
import { get } from "svelte/store";
import { Repo } from "@automerge/automerge-repo";

describe("root store", () => {
  let store: AutomergeStore<DocumentType>,
    rootStore: AutomergeSvelteStore<DocumentType>;

  beforeEach(() => {
    store = new AutomergeStore<DocumentType>("tests", from(documentData));
    rootStore = new AutomergeSvelteStore(store);
  });

  test("root store can be initialised without a store", () => {
    const rootStore = new AutomergeSvelteStore<DocumentType>();

    expect(rootStore).toBeDefined();
    expect(rootStore.get()).toEqual(null);
    expect(get(rootStore)).toEqual(null);
    return new Promise<void>((done) => {
      rootStore.ready.subscribe((ready) => {
        expect(ready).toBe(false);
        done();
      });
    });
  });

  test("root store with no AutomergeStore can have a new one swapped in", () => {
    const rootStore = new AutomergeSvelteStore<DocumentType>();

    rootStore.swapStore(store);
    expect(rootStore.get()).toEqual(documentData);

    return new Promise<void>((done) => {
      rootStore.ready.subscribe((ready) => {
        expect(ready).toBe(true);
        done();
      });
    });
  });

  test("root store contains the automerge store data", () => {
    expect(get(rootStore)).toEqual(documentData);

    expect(rootStore.get()).toEqual(documentData);
  });

  test("a root store is set as `ready`", () =>
    new Promise<void>((done) => {
      rootStore.ready.subscribe((ready) => {
        expect(ready).toBe(true);
        done();
      });
    }));

  test("an automerge-repo store can be passed in and is marked as ready", () => {
    const repo = new Repo({
      network: [],
    });

    const handle = repo.create<DocumentType>();
    handle.change((doc) => {
      Object.assign(doc, documentData);
    });

    const found = repo.find<DocumentType>(handle.url);

    const store = new AutomergeRepoStore<DocumentType>(found);
    const rootStore = new AutomergeSvelteStore(store);

    expect(get(rootStore.ready)).toBe(false);

    return new Promise<void>((done) => {
      rootStore.ready.subscribe((ready) => {
        if (!ready) return;

        expect(rootStore.get()).toEqual(documentData);
        done();
      });
    });
  });

  test("root store updates when the automerge store updates", () =>
    new Promise<void>((done) => {
      let initialRun = true;
      rootStore.subscribe((doc) => {
        if (initialRun) {
          expect(doc).toEqual(documentData);
          initialRun = false;
          return;
        }

        expect(doc.text.toString()).toEqual("hello there world");
        done();
      });

      store.change((doc) => {
        doc.text.insertAt(6, "there ");
      });
    }));

  test("root stores can be unsubscribed from", () =>
    new Promise<void>((done) => {
      let initialRun = true;
      let initialRun2 = true;
      rootStore.subscribe((doc) => {
        if (initialRun) {
          expect(doc).toEqual(documentData);
          initialRun = false;
          return;
        }

        expect(doc.text.toString()).toEqual("hello there world");
        done();
      });

      const sub2 = rootStore.subscribe((doc) => {
        if (initialRun2) {
          expect(doc).toEqual(documentData);
          initialRun2 = false;
          return;
        }
        new Error("This subscription should not have been called");
      });

      sub2();

      store.change((doc) => {
        doc.text.insertAt(6, "there ");
      });
    }));

  test("changes to the store can be batched in transactions", () => {
    return new Promise((done: Function) => {
      let calls = 0;
      rootStore.subscribe((doc) => {
        if (calls === 0) {
          expect({ ...doc }).toEqual(documentData);
          calls++;
          return;
        }
        expect({ ...doc }.array).toEqual(["hello", "world", "looking", "good"]);
        done();
      });

      rootStore.transaction(() => {
        rootStore.change((doc) => {
          doc.array.push("looking");
        });

        rootStore.change((doc) => {
          doc.array.push("good");
        });
      });
    });
  });

  test("changes to the store can be undone", () => {
    return new Promise((done: Function) => {
      let calls = 0;
      rootStore.subscribe((doc) => {
        if (calls === 0) {
          expect({ ...doc }).toEqual(documentData);
          calls++;
          return;
        } else if (calls === 1) {
          expect({ ...doc }.array).toEqual(["hello", "world", "looking"]);
          calls++;
          return;
        }
        expect({ ...doc }.array).toEqual(["hello", "world"]);
        done();
      });

      rootStore.transaction(() => {
        rootStore.change((doc) => {
          doc.array.push("looking");
        });
      });

      rootStore.undo();
    });
  });

  test("automerge stores can be swapped out", () =>
    new Promise<void>((done) => {
      const newData: DocumentType = {
        ...documentData,
        string: "hello there world",
      };
      const replacementDoc = from<DocumentType>(newData);

      let initialRun = true;
      rootStore.subscribe((doc) => {
        if (initialRun) {
          expect(doc).toEqual(documentData);
          initialRun = false;
          return;
        }

        expect(doc).toEqual(newData);
        done();
      });

      rootStore.swapStore(
        new AutomergeStore<DocumentType>("test2", replacementDoc)
      );
    }));

  test("a root store is set as `ready` after swapping", () =>
    new Promise<void>((done) => {
      let cycles = 0;

      rootStore.ready.subscribe((ready) => {
        if (cycles === 0) {
          expect(ready).toBe(true);
        } else if (cycles === 1) {
          expect(ready).toBe(false);
        } else if (cycles === 2) {
          expect(ready).toBe(true);
          done();
          return;
        }

        cycles++;
      });

      const newData: DocumentType = {
        ...documentData,
        string: "hello there world",
      };
      const replacementDoc = from<DocumentType>(newData);

      setTimeout(() => {
        rootStore.swapStore(
          new AutomergeStore<DocumentType>("test2", replacementDoc)
        );
      }, 100);
    }));

  test("the swapped store now receives changes", () => {
    const newData: DocumentType = {
      ...documentData,
      string: "hello there world",
    };
    const replacementDoc = from<DocumentType>(newData);

    rootStore.swapStore(
      new AutomergeStore<DocumentType>("test2", replacementDoc)
    );

    rootStore.change((doc) => {
      doc.text.insertAt(6, "there ");
    });

    expect(get(rootStore).text.toString()).toEqual("hello there world");

    expect(store.doc.text.toString()).toEqual("hello world");
  });

  test("local changes are not reflected in the base store", () =>
    new Promise<void>((done) => {
      let initialRun = true;
      rootStore.subscribe((doc) => {
        if (initialRun) {
          expect(doc).toEqual(documentData);
          initialRun = false;
          return;
        }

        expect(doc.string).toEqual("this is the one");
        expect(store.doc.string).toEqual("hello world");
        expect(rootStore.get()?.string).toEqual("hello world");
        done();
      });

      rootStore.localChange((doc) => {
        doc.string = "this is the one";

        return doc;
      });
    }));
});
