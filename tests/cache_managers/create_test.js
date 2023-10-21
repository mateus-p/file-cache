const { test } = require("node:test");

/**
 * @typedef {NonNullable<Parameters<typeof test>[0]>} TestFn
 * @param {Object} args
 * @param {string} args.name
 * @param {Object} args.tests
 * @param {TestFn} args.tests.test
 * @param {TestFn} args.tests.fromBuffer
 * @param {TestFn} args.tests.toBuffer
 */
module.exports = (args) => {
  return test(args.name, async (t) => {
    await t.test("#test:", args.tests.test);

    await t.test("#revive:", (t) => {
      t.skip("deprecated since v1.2");
    });

    await t.test("#fromBuffer:", args.tests.fromBuffer);

    await t.test("#bake:", (t) => {
      t.skip("deprecated since v1.2");
    });

    await t.test("#toBuffer:", args.tests.toBuffer);

    await t.test("#toJSON:", (t) => {
      t.skip("just a helper method");
    });
  });
};
