import { quickClone } from "./quick-clone";

export function dump(...args: any[]) {
  return console.log(...args.map((obj) => quickClone(obj)));
}
