import { Counter, Text } from "@automerge/automerge";
import { EntityState } from "@onsetsoftware/entity-state";

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
  surname: string;
  age: number;
  children: number;
  married: boolean;
  alive: boolean;
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
        surname: "Smith",
        age: 30,
        children: 0,
        married: true,
        alive: true,
      },
      "id-2": {
        id: "id-2",
        name: "John",
        surname: "Smith",
        age: 40,
        children: 0,
        married: false,
        alive: true,
      },
    },
  },
  checked: false,
};
