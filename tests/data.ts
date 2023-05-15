import { Counter, Text } from "@automerge/automerge";
import { EntityState } from "@onsetsoftware/mutable-js";

export type DocumentType = {
  string: string;
  text: Text;
  counter: Counter;
  array: string[];
  object: {
    hello: string;
    data?: string;
    empty?: string;
    text?: Text;
  };
  people: EntityState<Person>;
  checked: boolean;
};

export type Person = {
  id: string;
  name: string;
};

export const documentData: DocumentType = {
  string: "hello world",
  text: new Text("hello world"),
  counter: new Counter(0),
  array: ["hello", "world"],
  object: {
    hello: "world",
    empty: "",
    text: new Text("asdfg"),
  },
  people: {
    ids: ["id-1", "id-2"],
    entities: {
      "id-1": {
        id: "id-1",
        name: "Alex",
      },
      "id-2": {
        id: "id-2",
        name: "John",
      },
    },
  },
  checked: false,
};
