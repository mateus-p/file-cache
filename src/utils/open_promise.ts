/**
 * A Promise that can only be resolved or rejected from outside
 */
export class OpenPromise<Type> implements Promise<Type> {
  resolve!: (value: Type | PromiseLike<Type>) => void;
  reject!: (reason?: any) => void;

  #promise: Promise<Type>;

  [Symbol.toStringTag] = "OpenPromise";

  constructor() {
    this.#promise = new Promise<Type>((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }

  then<TResult1 = Type, TResult2 = never>(
    onfulfilled?: ((value: Type) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.#promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<Type | TResult> {
    return this.#promise.catch(onrejected);
  }
  finally(onfinally?: (() => void) | null): Promise<Type> {
    return this.#promise.finally(onfinally);
  }
}
