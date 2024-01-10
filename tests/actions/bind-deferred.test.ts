import { next as A } from "@automerge/automerge";
import { AutomergeStore } from "@onsetsoftware/automerge-store";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { get } from "svelte/store";
import { beforeEach, describe, expect, test } from "vitest";
import { AutomergeSvelteStore } from "../../src";
import ActionsComponent from "./setup/ActionsComponent.svelte";
import { document } from "./setup/document";
import type { DocumentShape } from "./setup/document.type";

describe("bind value/string deferred", async () => {
  let root: AutomergeStore<DocumentShape>;
  let store: AutomergeSvelteStore<DocumentShape>;
  beforeEach(async () => {
    root = new AutomergeStore<DocumentShape>("actions-store", A.from(document));

    store = new AutomergeSvelteStore(root);

    render(ActionsComponent, { props: { store } });
  });

  ["Value Deferred Input", "String Deferred Input"].forEach((label) => {
    test("updating the text input value updates the store", async () => {
      const user = userEvent.setup();
      const input: HTMLInputElement = screen.getByLabelText(label);

      expect(input.value).toBe("foo");

      expect(store.get()?.data.value).toBe("foo");
      expect(root.doc?.data.value).toBe("foo");

      let count = 0;

      const final = "foo bar";

      const localChangesComplete = new Promise<void>((resolve) => {
        const unsub = store.subscribe((doc) => {
          expect(doc.data.value).toBe(final.substring(0, count + 3));

          count++;
          if (count === 5) {
            unsub();
            resolve();
          }
        });
      });

      input.focus();
      await user.type(input, " bar");
      expect(input.value).toBe("foo bar");

      expect(get(store).data.value).toBe("foo bar");

      await localChangesComplete;

      expect(store.get()?.data.value).toBe("foo");
      expect(root.doc?.data.value).toBe("foo");
      input.blur();

      expect(store.get()?.data.value).toBe("foo bar");
      expect(root.doc?.data.value).toBe("foo bar");
    });

    test("updating the store updates the value", async () => {
      const input: HTMLInputElement = screen.getByLabelText(label);
      expect(input.value).toBe("foo");

      store.change((doc) => {
        doc.data.value = "foo bar";
      });

      expect(input.value).toBe("foo bar");
    });
  });
});
