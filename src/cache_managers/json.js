const { inspect } = require("util");

/**
 * @type {import('./json').JSONManager}
 */
const JSONManager = {
  revive: ({ buffer }) => {
    return JSONManager.fromBuffer(buffer());
  },
  fromBuffer: (buf) => {
    if (buf instanceof Promise) {
      return buf.then((data) => JSON.parse(data.toString("utf-8")));
    }

    return JSON.parse(buf.toString());
  },
  toBuffer: (value) => Buffer.from(JSON.stringify(value), "utf-8"),
  bake: (value) => JSONManager.toBuffer(value),
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
