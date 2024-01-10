import { beforeEach, describe, expect, test } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/svelte";
import ActionsComponent from "./setup/ActionsComponent.svelte";
import { AutomergeStore } from "@onsetsoftware/automerge-store";
import type { DocumentShape } from "./setup/document.type";
import { AutomergeSvelteStore } from "../../src";
import { next as A } from "@automerge/automerge";
import { document } from "./setup/document";

describe("bind value/string", async () => {
  let root: AutomergeStore<DocumentShape>;
  let store: AutomergeSvelteStore<DocumentShape>;
  beforeEach(async () => {
    root = new AutomergeStore<DocumentShape>("actions-store", A.from(document));

    store = new AutomergeSvelteStore(root);

    render(ActionsComponent, { props: { store } });
  });

  ["Value Input", "String Input"].forEach((label) => {
    test("updating the text input value updates the store", async () => {
      const user = userEvent.setup();
      const input: HTMLInputElement = screen.getByLabelText(label);
      expect(input.value).toBe("foo");

      expect(store.get()?.data.value).toBe("foo");
      expect(root.doc?.data.value).toBe("foo");

      input.focus();
      await user.type(input, " bar");
      expect(input.value).toBe("foo bar");

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
