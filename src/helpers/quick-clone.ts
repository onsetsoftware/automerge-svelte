export function quickClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
