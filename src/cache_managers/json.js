const { inspect } = require("util");

const JSONManager = {
  revive: async ({ buffer }) => {
    const buf_string = (await buffer()).toString("utf-8");
    return JSON.parse(buf_string);
  },
  bake: (value) => Buffer.from(JSON.stringify(value), "utf-8"),
  test: (value) => {
    try {
      JSON.stringify(value);

      return { pass: true };
    } catch (err) {
      return { pass: false, failReason: inspect(err) };
    }
  },
  toJSON: () => "[[BuiltInManagers#JSON]]",
};

module.exports.JSONManager = JSONManager;
