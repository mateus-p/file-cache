import { TimeoutError } from "./timeout_error";
import { OpenPromise } from "./open_promise";

/**
 * A Promise that rejects after `timeout`
 */
export declare class TimeoutPromise<T> extends OpenPromise<T> {
  private timeout: NodeJS.Timeout | null;

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void,
    timeout?: number
  );

  override then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;

  override catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | TResult>;
}
