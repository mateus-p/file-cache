/**
 * @type {import('./string').StringManager}
 */
const StringManager = {
  revive: async ({ buffer }) => {
    return StringManager.fromBuffer(buffer());
  },
  fromBuffer: (buf) => {
    if (buf instanceof Promise) {
      return buf.then((data) => data.toString("utf-8"));
    }

    return buf.toString("utf-8");
  },
  toBuffer: (value) => Buffer.from(value, "utf-8"),
  bake: (value) => StringManager.toBuffer(value),
  test: (value) => ({
    pass: typeof value == "string",
    failReason: typeof value != "string" ? "value is not a string" : undefined,
  }),
  toJSON: () => "[[BuiltInManagers#String]]",
};

module.exports.StringManager = StringManager;
