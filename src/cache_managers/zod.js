const { serialize, deserialize } = require("v8");
const { inspect } = require("util");

function createZodManager(obj) {
  /** @type {import('./zod').ZodManager<any>} */
  const manager = {
    toBuffer: (value) => serialize(value),
    bake: (value) => manager.toBuffer(value),
    revive: ({ buffer }) => {
      return manager.fromBuffer(buffer());
    },
    fromBuffer: (buf) => {
      if (buf instanceof Promise) {
        return buf.then((data) => deserialize(data));
      }

      return deserialize(buf);
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

  return manager;
}

module.exports.createZodManager = createZodManager;
