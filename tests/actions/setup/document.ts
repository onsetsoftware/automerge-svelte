import { DocumentShape } from "./document.type";
export const document: DocumentShape = {
  checked: false,
  data: {
    value: "foo",
    string: "bar",
  },
  people: {
    ids: ["1", "2", "3"],
    entities: {
      "1": {
        id: "1",
        name: "Alice",
        location: "London",
        age: 30,
        loggedIn: true,
      },
      "2": {
        id: "2",
        name: "Bob",
        location: "Paris",
        age: 40,
        loggedIn: false,
      },
      "3": {
        id: "3",
        name: "Charlie",
        location: "New York",
        age: 50,
        loggedIn: true,
      },
    },
  },
};
