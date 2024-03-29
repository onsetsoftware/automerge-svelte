import { next as A } from "@automerge/automerge";
import { AutomergeStore } from "@onsetsoftware/automerge-store";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { get, writable } from "svelte/store";
import { beforeEach, describe, expect, test } from "vitest";
import {
  AutomergeEntityStore,
  AutomergeSvelteInput,
  AutomergeSvelteStore,
} from "../../src";
import ActionsComponent from "./setup/EntityActionsComponent.svelte";
import { document } from "./setup/document";
import type { DocumentShape, Person } from "./setup/document.type";
import { tick } from "svelte";

Object.entries({
  "Value Deferred Input": "name",
  "Int Deferred Input": "age",
  "String Deferred Input": "location",
}).forEach(([label, field]) => {
  describe(label + " - bind entity value/string deferred", async () => {
    let root: AutomergeStore<DocumentShape>;
    let store: AutomergeSvelteStore<DocumentShape>;
    let entityStore: AutomergeEntityStore<DocumentShape, Person>;

    beforeEach(async () => {
      root = new AutomergeStore<DocumentShape>(
        "actions-store",
        A.from(document),
      );

      store = new AutomergeSvelteStore(root);

      entityStore = new AutomergeEntityStore(store, (doc) => doc.people);
    });

    test("updating the text input value updates the store and emits an updated event", async () => {
      const user = userEvent.setup();
      render(ActionsComponent, { props: { store: entityStore } });
      const input: HTMLInputElement = screen.getByLabelText(label);
      const updated = new Promise<void>((resolve) => {
        const listener = () => {
          input.removeEventListener("updated", listener);
          resolve();
        };
        input.addEventListener("updated", listener);
      });

      expect(input.value).toBe("");

      const toType = field === "age" ? "22" : "Alex";

      input.focus();
      await user.type(input, toType);
      expect(input.value).toBe(toType);

      expect(get(store).people.entities["1"][field]).toBe(
        document.people.entities["1"][field],
      );
      expect(get(store).people.entities["2"][field]).toBe(
        document.people.entities["2"][field],
      );

      input.blur();

      expect(get(store).people.entities["1"][field].toString()).toBe(toType);
      expect(get(store).people.entities["2"][field].toString()).toBe(toType);

      return updated;
    });

    test("updating the ids updates the value", async () => {
      const ids = writable(["1"]);

      render(ActionsComponent, { props: { store: entityStore, ids } });

      const input: HTMLInputElement = screen.getByLabelText(label);
      expect(input.value).toBe(document.people.entities["1"][field].toString());

      ids.set(["2"]);
      await tick();

      expect(input.value).toBe(document.people.entities["2"][field].toString());
    });

    test("changing ids following a change updates the value and emits an `update` event", async () => {
      const ids = writable(["1", "2"]);
      render(ActionsComponent, { props: { ids, store: entityStore } });
      const user = userEvent.setup();
      const input: HTMLInputElement = screen.getByLabelText(label);

      const updated = new Promise<void>((resolve) => {
        const listener = (e: Event) => {
          expect((e as CustomEvent).detail.options.ids).toEqual(["3"]);
          expect((e as CustomEvent).detail.previousOptions.ids).toEqual([
            "1",
            "2",
          ]);
          input.removeEventListener("updated", listener);
          resolve();
        };
        input.addEventListener("updated", listener);
      });

      const toType = field === "age" ? "22" : "Alex";

      expect(input.value).toBe("");

      input.focus();
      await user.type(input, toType);
      expect(input.value).toBe(toType);

      expect(get(store).people.entities["1"][field]).toBe(
        document.people.entities["1"][field],
      );
      expect(get(store).people.entities["2"][field]).toBe(
        document.people.entities["2"][field],
      );

      ids.set(["3"]);

      await updated;

      expect(get(store).people.entities["1"][field].toString()).toBe(toType);
      expect(get(store).people.entities["2"][field].toString()).toBe(toType);
    });

    test("keeping the ids the same (but causing the action to update) doesn't cancel a change", async () => {
      const ids = writable(["1", "2"]);
      render(ActionsComponent, { props: { ids, store: entityStore } });
      const user = userEvent.setup();
      const input: HTMLInputElement = screen.getByLabelText(label);

      const toType = field === "age" ? "22" : "Alex";

      expect(input.value).toBe("");

      input.focus();
      await user.type(input, toType);
      expect(input.value).toBe(toType);

      expect(get(store).people.entities["1"][field]).toBe(
        document.people.entities["1"][field],
      );
      expect(get(store).people.entities["2"][field]).toBe(
        document.people.entities["2"][field],
      );

      ids.set(["1", "2"]);

      await tick();

      input.blur();

      expect(get(store).people.entities["1"][field].toString()).toBe(toType);
      expect(get(store).people.entities["2"][field].toString()).toBe(toType);
    });

    test("with manualSave, blurring a changed input then changing the action options emits an update event", async () => {
      const ids = writable(["1", "2"]);
      render(ActionsComponent, {
        props: { manualSave: true, ids, store: entityStore },
      });
      const user = userEvent.setup();
      const input: HTMLInputElement = screen.getByLabelText(label);

      const createUpdatePromise = () =>
        new Promise<void>((resolve) => {
          const listener = () => {
            input.removeEventListener("updated", listener);
            resolve();
          };
          input.addEventListener("updated", listener);
        });

      const toType = field === "age" ? "22" : "Alex";

      expect(input.value).toBe("");

      input.focus();
      await user.type(input, toType);
      expect(input.value).toBe(toType);

      const updated = createUpdatePromise();
      input.blur();

      await updated;

      const updated2 = createUpdatePromise();

      ids.set(["3"]);

      return updated2;
    }, 200);

    test("changing ids when there has been no change does not update the store", async () => {
      const ids = writable(["1", "2"]);
      render(ActionsComponent, { props: { ids, store: entityStore } });
      const input: AutomergeSvelteInput = screen.getByLabelText(label);

      expect(input.value).toBe("");

      input.focus();

      expect(get(store).people.entities["1"][field]).toBe(
        document.people.entities["1"][field],
      );
      expect(get(store).people.entities["2"][field]).toBe(
        document.people.entities["2"][field],
      );

      ids.set(["3"]);

      await tick();

      expect(get(store).people.entities["1"][field]).toBe(
        document.people.entities["1"][field],
      );
      expect(get(store).people.entities["2"][field]).toBe(
        document.people.entities["2"][field],
      );
    });

    test("updating the store updates the value", async () => {
      render(ActionsComponent, { props: { store: entityStore } });
      const input: HTMLInputElement = screen.getByLabelText(label);
      expect(input.value).toBe("");

      entityStore.change((doc) => {
        doc.entities["1"][field] = document.people.entities["2"][field];
      });

      expect(input.value).toBe(document.people.entities["2"][field].toString());
    });

    test("inputs can be reset", async () => {
      render(ActionsComponent, {
        props: { manualSave: true, store: entityStore },
      });

      const user = userEvent.setup();
      const input: AutomergeSvelteInput = screen.getByLabelText(label);

      expect(input.value).toBe("");

      const toType = field === "age" ? "22" : "Alex";

      input.focus();
      await user.type(input, toType);
      expect(input.value).toBe(toType);

      input.reset();
      expect(input.value).toBe("");
      expect(get(store).people.entities["1"][field]).toBe(
        document.people.entities["1"][field],
      );
      expect(get(store).people.entities["2"][field]).toBe(
        document.people.entities["2"][field],
      );
    });

    test("inputs marked as manualSave don't get written automatically", async () => {
      render(ActionsComponent, {
        props: { manualSave: true, store: entityStore },
      });
      const user = userEvent.setup();
      const input: HTMLInputElement = screen.getByLabelText(label);

      expect(input.value).toBe("");

      const toType = field === "age" ? "22" : "Alex";

      input.focus();
      await user.type(input, toType);
      expect(input.value).toBe(toType);

      input.blur();
      expect(get(store).people.entities["1"][field]).toBe(
        document.people.entities["1"][field],
      );
      expect(get(store).people.entities["2"][field]).toBe(
        document.people.entities["2"][field],
      );
    });

    test("inputs marked as manualSave are saved when save is called", async () => {
      render(ActionsComponent, {
        props: { manualSave: true, store: entityStore },
      });
      const user = userEvent.setup();
      const input: AutomergeSvelteInput = screen.getByLabelText(label);

      expect(input.value).toBe("");

      const toType = field === "age" ? "22" : "Alex";

      input.focus();
      await user.type(input, toType);
      expect(input.value).toBe(toType);

      input.save();

      expect(get(store).people.entities["1"][field].toString()).toBe(toType);
      expect(get(store).people.entities["2"][field].toString()).toBe(toType);
    });
  });
});
