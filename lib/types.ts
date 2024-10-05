export type MaybePromise<T> = T | Promise<T>;

export type RequiredKeys<T, K extends keyof T> = T & Pick<Required<T>, K>;

export type Filter<T, U> = T extends U ? T : U extends Pick<T, keyof U & keyof T> ? T : never;
