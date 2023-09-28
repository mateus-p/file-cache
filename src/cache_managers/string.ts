import { CacheValueManager } from "./types";

const StringManager: CacheValueManager<string> = {
  revive: async ({ buffer }) => {
    return (await buffer()).toString();
  },
  bake: (value) => Buffer.from(value, "utf-8"),
  test: (value) => ({
    pass: typeof value == "string",
    failReason: typeof value != "string" ? "value is not a string" : undefined,
  }),
};

export default StringManager;
