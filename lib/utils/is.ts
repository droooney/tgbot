export function isTruthy<T>(value: T): value is Exclude<T, null | undefined | false | 0 | ''> {
  return Boolean(value);
}
