import { Counter, Text } from "@automerge/automerge";

export type DocumentType = typeof documentData;

export const documentData: {
  string: string;
  text: Text;
  counter: Counter;
  array: string[];
  object?: {
    hello: string;
    data?: string;
    empty?: string;
    text?: Text;
  };
  people: {
    ids: string[];
    entities: {
      [id: string]: {
        name: string;
        id: string;
      };
    };
  };
} = {
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
};
