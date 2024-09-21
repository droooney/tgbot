export function isTruthy<T>(value: T): value is Exclude<T, null | undefined | false | 0 | ''> {
  return Boolean(value);
}

export const isArray: (value: unknown) => value is unknown[] = Array.isArray;
