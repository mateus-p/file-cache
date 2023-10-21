const createTest = require("./create_test");
const assert = require("node:assert/strict");

const { StringManager } = require("../../src/cache_managers/string");

createTest({
  name: "StringManager",
  tests: {
    test: async (t) => {
      await t.test("should fail for non string values", () => {
        assert.equal(StringManager.test(0).pass, false);
        assert.equal(StringManager.test(null).pass, false);
      });

      await t.test("should work for string values", () => {
        assert.equal(StringManager.test("").pass, true);
      });
    },

    fromBuffer: async (t) => {
      await t.test("should syncronously get value from Buffer", () => {
        const str = "test",
          str_buffer = Buffer.from(str);

        assert.equal(StringManager.fromBuffer(str_buffer), str);
      });
    },

    toBuffer: async (t) => {
      await t.test(
        "should asyncronously get value from Promise<Buffer>",
        async () => {
          const str = "test",
            str_buffer = Promise.resolve(Buffer.from(str));

          const result = StringManager.fromBuffer(str_buffer);

          if (!(result instanceof Promise)) {
            assert.fail("StringManager#fromBuffer did not return a promise");
          }

          assert.equal(await result, str);
        }
      );
    },
  },
});
