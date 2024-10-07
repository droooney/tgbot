export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type PromiseWithResolvers<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (err?: unknown) => void;
};

export function promiseWithResolvers<T>(): PromiseWithResolvers<T> {
  let res: ((value: T | PromiseLike<T>) => void) | undefined;
  let rej: ((err?: unknown) => void) | undefined;

  return {
    resolve: (value) => {
      res?.(value);
    },
    reject: (err) => {
      rej?.(err);
    },
    promise: new Promise<T>((resolve, reject) => {
      res = resolve;
      rej = reject;
    }),
  };
}
