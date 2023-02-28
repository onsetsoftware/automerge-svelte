import { getByPath, type Path, type PathValue } from "dot-path-value";

export function setByPath<T extends Record<string, any>, TPath extends Path<T>>(
  obj: T,
  path: TPath,
  value: PathValue<T, TPath>
) {
  const [key, ...route] = (path.split(".") as TPath[]).reverse();

  const target = route.length
    ? getByPath(obj, route.reverse().join(".") as Path<T>)
    : obj;

  if (target) {
    target[key!] = value;
  }
}
