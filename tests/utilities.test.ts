import { EntityState } from "@onsetsoftware/entity-state";
import { beforeEach, describe, expect, test } from "vitest";
import { Person, documentData } from "./data";

import { quickClone } from "../src/helpers/quick-clone";
import { getEntitiesValue } from "../src/actions/utilities";

describe("Get entities value", () => {
  let people: EntityState<Person>;

  beforeEach(() => {
    people = quickClone(documentData.people);
  });

  const testCases = [
    {
      path: "name",
      expected: "",
    },
    {
      path: "surname",
      expected: "Smith",
    },
    {
      path: "age",
      expected: "",
    },
    {
      path: "children",
      expected: 0,
    },
    {
      path: "married",
      expected: "",
    },
    {
      path: "alive",
      expected: true,
    },
  ] as const;

  testCases.forEach((testCase) => {
    test("it should return the correct " + testCase.path, () => {
      expect(getEntitiesValue(people, ["id-1", "id-2"], testCase.path)).toBe(
        testCase.expected,
      );
    });
  });
});
