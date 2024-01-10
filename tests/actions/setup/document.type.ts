import { EntityState } from "@onsetsoftware/entity-state";

export type Person = {
  id: string;
  name: string;
  location: string;
  age: number;
  loggedIn: boolean;
};

export type DocumentShape = {
  checked: boolean;
  data: {
    value: string;
    string: string;
  };
  people: EntityState<Person>;
};
