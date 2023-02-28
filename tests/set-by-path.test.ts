import { beforeEach, describe, expect, test } from "vitest";
import { setByPath } from "../src/set-by-path";

let obj: { a: { b: { c: number } }; d: { e: number }[] };

describe("", () => {
  beforeEach(() => {
    obj = { a: { b: { c: 1 } }, d: [{ e: 2 }, { e: 3 }] };
  });

  test("a nested value should be able to be set", () => {
    setByPath(obj, "a.b.c", 2);
    expect(obj.a.b.c).toEqual(2);

    setByPath(obj, "d.0.e", 4);
    expect(obj.d[0].e).toEqual(4);

    setByPath(obj, "d", []);
    expect(obj.d).toEqual([]);
  });
});
