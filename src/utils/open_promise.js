class OpenPromise {
  #promise = null;

  [Symbol.toStringTag] = "OpenPromise";

  constructor() {
    this.#promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }

  then(onfulfilled, onrejected) {
    return this.#promise.then(onfulfilled, onrejected);
  }

  catch(onrejected) {
    return this.#promise.catch(onrejected);
  }

  finally(onfinally) {
    return this.#promise.finally(onfinally);
  }
}

module.exports.OpenPromise = OpenPromise;
