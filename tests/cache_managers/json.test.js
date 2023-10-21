const createTest = require("./create_test");
const assert = require("node:assert/strict");

const { JSONManager } = require("../../src/cache_managers/json");

createTest({
  name: "JSONManager",
  tests: {
    test: async (t) => {
      await t.test("should fail for non JSON compatible values", () => {
        assert.equal(JSONManager.test(undefined).pass, false);

        assert.equal(JSONManager.test(1n).pass, false);
      });

      await t.test("should work for JSON compatible values", () => {
        assert.equal(JSONManager.test("").pass, true);

        assert.equal(JSONManager.test({}).pass, true);

        assert.equal(JSONManager.test(0).pass, true);

        assert.equal(JSONManager.test(null).pass, true);

        assert.equal(JSONManager.test(false).pass, true);
      });
    },

    fromBuffer: async (t) => {
      await t.test("should syncronously get value from Buffer", () => {
        assert.equal(JSONManager.fromBuffer(Buffer.from('""')), "");

        assert.equal(JSONManager.fromBuffer(Buffer.from("0")), 0);

        assert.equal(JSONManager.fromBuffer(Buffer.from("null")), null);

        assert.equal(JSONManager.fromBuffer(Buffer.from("true")), true);

        assert.deepEqual(JSONManager.fromBuffer(Buffer.from('{ "r": 0 }')), {
          r: 0,
        });
      });

      await t.test(
        "should asyncronously get value from Promise<Buffer>",
        async () => {
          const buf_promise = Promise.resolve(Buffer.from('{ "r": 0 }'));

          const result = JSONManager.fromBuffer(buf_promise);

          if (!(result instanceof Promise)) {
            assert.fail("JSONManager#fromBuffer did not return a promise");
          }

          assert.deepEqual(await result, {
            r: 0,
          });
        }
      );
    },

    toBuffer: async (t) => {
      await t.test(
        "should return a Buffer containing corresponding data",
        () => {
          const number_result = JSONManager.toBuffer(0);
          const string_result = JSONManager.toBuffer("");
          const object_result = JSONManager.toBuffer({});
          const null_result = JSONManager.toBuffer(null);
          const boolean_result = JSONManager.toBuffer(true);

          if (
            !(
              number_result instanceof Buffer &&
              string_result instanceof Buffer &&
              object_result instanceof Buffer &&
              null_result instanceof Buffer &&
              boolean_result instanceof Buffer
            )
          ) {
            assert.fail("result is not a Buffer");
          }

          assert.equal(number_result.toString(), "0");
          assert.equal(string_result.toString(), '""');
          assert.equal(object_result.toString(), "{}");
          assert.equal(null_result.toString(), "null");
          assert.equal(boolean_result.toString(), "true");
        }
      );
    },
  },
});
