const { serialize, deserialize } = require("v8");
const { inspect } = require("util");

function createZodManager(obj) {
  return {
    bake: (value) => serialize(value),
    revive: async ({ buffer }) => {
      return deserialize(await buffer());
    },
    test: (value) => {
      const parsed = obj.safeParse(value);

      return {
        pass: parsed.success,
        failReason: !parsed.success
          ? inspect(parsed.error, false, 200, true)
          : undefined,
      };
    },
    toJSON: () => "[[BuiltInManagers#Zod]]",
    zodTest: (value) => {
      return obj.safeParse(value);
    },
  };
}

module.exports.createZodManager = createZodManager;
