import { TimeoutError } from "./timeout_error";
import { OpenPromise } from "./open_promise";

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
