export type MaybePromise<T> = T | Promise<T>;

export type RequiredKeys<T, K extends keyof T> = T & Pick<Required<T>, K>;
