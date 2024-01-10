import { beforeEach, describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import ActionsComponent from "./setup/ActionsComponent.svelte";
import { AutomergeStore } from "@onsetsoftware/automerge-store";
import type { DocumentShape } from "./setup/document.type";
import { AutomergeSvelteStore } from "../../src";
import { next as A } from "@automerge/automerge";
import { document } from "./setup/document";

describe("bind-checked", async () => {
  let root: AutomergeStore<DocumentShape>;
  let store: AutomergeSvelteStore<DocumentShape>;
  beforeEach(async () => {
    root = new AutomergeStore<DocumentShape>("actions-store", A.from(document));

    store = new AutomergeSvelteStore(root);

    render(ActionsComponent, { props: { store } });
  });

  test("updating a checkbox updates the store", async () => {
    const checkbox = screen.getByLabelText("checked");
    expect(checkbox).not.toBeChecked();

    expect(store.get()?.checked).toBe(false);
    expect(root.doc?.checked).toBe(false);

    checkbox.click();
    expect(checkbox).toBeChecked();

    expect(store.get()?.checked).toBe(true);
    expect(root.doc?.checked).toBe(true);
  });

  test("updating the store updates the checkbox", async () => {
    const checkbox = screen.getByLabelText("checked");
    expect(checkbox).not.toBeChecked();

    expect(store.get()?.checked).toBe(false);
    expect(root.doc?.checked).toBe(false);

    store.change((doc) => {
      doc.checked = true;
    });
    expect(checkbox).toBeChecked();

    expect(store.get()?.checked).toBe(true);
    expect(root.doc?.checked).toBe(true);
  });
});
