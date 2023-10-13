import { CacheValueManager } from "./types";

/**
 * This value manager handles string cache values, formatted in UTF-8.
 */
const StringManager: CacheValueManager<string> = {
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

export default StringManager;
