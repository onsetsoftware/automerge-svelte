import type {
  DelPatch,
  InsertPatch,
  SpliceTextPatch,
} from "@automerge/automerge";
import type { Change } from "diff";
import { diffChars } from "diff";

export type TextPatch = DelPatch | InsertPatch;
export type StringPatch = DelPatch | SpliceTextPatch;

export function getTextPatches(old: string, updated: string) {
  return diffToTextPatches(diffChars(old, updated));
}

export function getStringPatches(old: string, updated: string) {
  return diffToStringPatches(diffChars(old, updated));
}

function diffToTextPatches(changes: Change[]): TextPatch[] {
  let index = 0;
  return changes.reduce((acc: TextPatch[], change) => {
    if (change.removed) {
      acc.push({
        action: "del",
        path: [index],
        length: change.count,
      });

      return acc;
    }

    if (change.added) {
      acc.push({
        action: "insert",
        path: [index],

        values: change.value.split(""),
      });
    }

    index += change.count || 0;

    return acc;
  }, []);
}

export function diffToStringPatches(changes: Change[]): StringPatch[] {
  let index = 0;
  return changes.reduce((acc: StringPatch[], change) => {
    if (change.removed) {
      acc.push({
        action: "del",
        path: [index],
        length: change.count,
      });

      return acc;
    }

    if (change.added) {
      acc.push({
        action: "splice",
        path: [index],

        value: change.value,
      });
    }

    index += change.count || 0;

    return acc;
  }, []);
}
