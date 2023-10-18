const { TimeoutError } = require("./timeout_error");
const { OpenPromise } = require("./open_promise");

class TimeoutPromise extends OpenPromise {
  constructor(executor, timeout = 0) {
    super();

    executor(this.resolve, this.reject);

    this.timeout = setTimeout(() => this.reject(new TimeoutError()), timeout);
  }

  then(onfulfilled, onrejected) {
    return super.then(
      (value) => {
        if (this.timeout) clearTimeout(this.timeout);

        return onfulfilled?.(value) || value;
      },
      (reason) => {
        if (this.timeout) clearTimeout(this.timeout);

        return onrejected?.(reason) || reason;
      }
    );
  }

  catch(onrejected) {
    return super.catch((reason) => {
      if (this.timeout) clearTimeout(this.timeout);

      return onrejected?.(reason) || reason;
    });
  }
}

module.exports.TimeoutPromise = TimeoutPromise;
