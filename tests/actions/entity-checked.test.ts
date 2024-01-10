import { beforeEach, describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import ActionsComponent from "./setup/EntityActionsComponent.svelte";
import { AutomergeStore } from "@onsetsoftware/automerge-store";
import type { DocumentShape, Person } from "./setup/document.type";
import { AutomergeEntityStore, AutomergeSvelteStore } from "../../src";
import { next as A } from "@automerge/automerge";
import { document } from "./setup/document";
import { get, writable } from "svelte/store";

describe("bind entity checked", async () => {
  let root: AutomergeStore<DocumentShape>;
  let store: AutomergeSvelteStore<DocumentShape>;
  let entityStore: AutomergeEntityStore<DocumentShape, Person>;
  beforeEach(async () => {
    root = new AutomergeStore<DocumentShape>("actions-store", A.from(document));

    store = new AutomergeSvelteStore(root);
    entityStore = new AutomergeEntityStore(store, (doc) => doc.people);
  });

  test("checkbox is unchecked when multiple, different entities are selected", async () => {
    render(ActionsComponent, { props: { store: entityStore } });
    const checkbox: HTMLInputElement = screen.getByLabelText("checked");
    expect(checkbox).not.toBeChecked();
  });

  test("checkbox is indeterminate when multiple, different entities are selected", async () => {
    render(ActionsComponent, { props: { store: entityStore } });
    const checkbox: HTMLInputElement = screen.getByLabelText("checked");
    expect(checkbox.indeterminate).toBe(true);
  });

  test("checkbox is checked when a single true entity is selected", async () => {
    render(ActionsComponent, {
      props: { store: entityStore, ids: writable(["1"]) },
    });
    const checkbox: HTMLInputElement = screen.getByLabelText("checked");
    expect(checkbox).toBeChecked();
  });

  test("checkbox is unchecked when a single false entity is selected", async () => {
    render(ActionsComponent, {
      props: { store: entityStore, ids: writable(["2"]) },
    });
    const checkbox: HTMLInputElement = screen.getByLabelText("checked");
    expect(checkbox).not.toBeChecked();
  });

  test("checkbox is checked when multiple true entities are selected", async () => {
    render(ActionsComponent, {
      props: { store: entityStore, ids: writable(["1", "3"]) },
    });
    const checkbox: HTMLInputElement = screen.getByLabelText("checked");
    expect(checkbox).toBeChecked();
  });

  test("updating a checkbox updates the store", async () => {
    const ids = writable(["1", "2"]);
    render(ActionsComponent, { props: { ids, store: entityStore } });
    const checkbox: HTMLInputElement = screen.getByLabelText("checked");
    expect(checkbox).not.toBeChecked();

    expect(entityStore.get()?.entities[1].loggedIn).toBe(true);
    expect(entityStore.get()?.entities[2].loggedIn).toBe(false);

    checkbox.click();
    expect(checkbox).toBeChecked();

    get(ids).forEach((id) => {
      expect(entityStore.get()?.entities[id].loggedIn).toBe(true);
    });
  });

  test("updating the store updates the checkbox", async () => {
    render(ActionsComponent, { props: { store: entityStore } });

    const checkbox: HTMLInputElement = screen.getByLabelText("checked");
    expect(checkbox).not.toBeChecked();

    entityStore.update({
      id: "2",
      loggedIn: true,
    });

    expect(checkbox).toBeChecked();
    expect(checkbox.indeterminate).toBe(false);
  });
});
