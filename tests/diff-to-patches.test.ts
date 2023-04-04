import type { DelPatch, InsertPatch } from "@automerge/automerge";
import { change, from, Text } from "@automerge/automerge";
import { patch } from "@onsetsoftware/automerge-patcher";
import { beforeEach, describe, expect, test } from "vitest";
import { getStringPatches, getTextPatches } from "../src/diff-to-patches";

describe("convert changes from diff into automerge patches", () => {
  beforeEach(() => {});

  type Test = {
    name: string;
    a: string;
    b: string;
    expectedPatches: (DelPatch | InsertPatch)[];
  };

  const tests: Test[] = [
    {
      name: "no change",
      a: "hello",
      b: "hello",
      expectedPatches: [],
    },
    {
      name: "complete change",
      a: "qwert",
      b: "asdfg",
      expectedPatches: [
        { action: "del", path: [0], length: 5 },
        { action: "insert", path: [0], values: "asdfg".split("") },
      ],
    },
    {
      name: "simple text insert",
      a: "hello",
      b: "hello world",
      expectedPatches: [
        {
          action: "insert",
          path: [5],
          values: " world".split(""),
        },
      ],
    },

    {
      name: "simple text delete",
      a: "hello",
      b: "hllo",
      expectedPatches: [
        {
          action: "del",
          path: [1],
          length: 1,
        },
      ],
    },
    {
      name: "delete and insert",
      a: "hello",
      b: "help",
      expectedPatches: [
        {
          action: "del",
          path: [3],
          length: 2,
        },
        {
          action: "insert",
          path: [3],
          values: ["p"],
        },
      ],
    },
    {
      name: "delete and insert 2",
      a: "a12345g",
      b: "asdfg",
      expectedPatches: [
        {
          action: "del",
          path: [1],
          length: 5,
        },
        {
          action: "insert",
          path: [1],
          values: ["s", "d", "f"],
        },
      ],
    },
  ];

  tests.forEach((testData) => {
    test(testData.name, () => {
      const patches = getTextPatches(testData.a, testData.b);
      expect(patches).toEqual(testData.expectedPatches);

      const doc = from<{ hello: Text }>({ hello: new Text(testData.a) });
      const updated = change<{ hello: Text }>(doc, (d) => {
        patches.forEach((p) => {
          p.path.unshift("hello");
          patch(d, p);
        });
      });

      expect(updated.hello.toString()).toEqual(testData.b);

      const stringPatches = getStringPatches(testData.a, testData.b);

      expect(stringPatches).toEqual(
        testData.expectedPatches.map((p) => {
          if (p.action === "insert") {
            return {
              action: "splice",
              path: p.path,
              value: p.values.join(""),
            };
          }

          return p;
        }),
      );
    });
  });
});
