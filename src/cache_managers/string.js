const StringManager = {
  revive: async ({ buffer }) => {
    return (await buffer()).toString("utf-8");
  },
  bake: (value) => Buffer.from(value, "utf-8"),
  test: (value) => ({
    pass: typeof value == "string",
    failReason: typeof value != "string" ? "value is not a string" : undefined,
  }),
  toJSON: () => "[[BuiltInManagers#String]]",
};

module.exports.StringManager = StringManager;
