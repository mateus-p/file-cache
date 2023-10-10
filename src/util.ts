/**
 * Await End Of Stack
 */
export function awaitEOS() {
  return new Promise<void>((res) => {
    setTimeout(res);
  });
}

/**
 * @param predicate If returned == false, keep waiting
 */
export async function waitUntil(predicate: () => boolean) {
  while (true) {
    if (predicate()) break;
    await awaitEOS();
  }
}

/**
 * A Promise that can only be resolved or rejected from outside
 */
export class OpenPromise<Type> extends Promise<Type> {
  resolve: (value: Type | PromiseLike<Type>) => void;
  reject: (reason?: any) => void;

  /**
   *
   * @param a Used internally by `Promise`
   */
  constructor(a?: any) {
    let resolver!: (value: Type | PromiseLike<Type>) => void,
      rejecter!: (reason?: any) => void;

    super(
      a ||
        ((res, rej) => {
          resolver = res;
          rejecter = rej;
        })
    );

    this.resolve = resolver;
    this.reject = rejecter;
  }
}

export class TimeoutError extends Error {
  constructor() {
    super("timed out");

    this.name = "TimeoutError";
  }
}

/**
 * @extends OpenPromise
 *
 * A Promise that rejects after `timeout`
 */
export class TimeoutPromise<T> extends OpenPromise<T> {
  private timeout: NodeJS.Timeout | null = null;

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void,
    timeout = 0
  ) {
    super();

    executor(this.resolve, this.reject);

    this.timeout = setTimeout(() => this.reject(new TimeoutError()), timeout);
  }

  override then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return super.then(
      (value) => {
        if (this.timeout) clearTimeout(this.timeout);

        return onfulfilled?.(value) || (value as any);
      },
      (reason) => {
        if (this.timeout) clearTimeout(this.timeout);

        return onrejected?.(reason) || reason;
      }
    );
  }

  override catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | TResult> {
    return super.catch((reason) => {
      if (this.timeout) clearTimeout(this.timeout);

      return onrejected?.(reason) || reason;
    });
  }
}
