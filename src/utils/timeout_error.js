class TimeoutError extends Error {
  constructor() {
    super("timed out");

    this.name = "TimeoutError";
  }
}

module.exports.TimeoutError = TimeoutError;
