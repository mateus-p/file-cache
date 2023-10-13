import { CacheValueManager } from "./types";
import { inspect } from "util";

/**
 * This value manager handles JSON string cache values, formatted in UTF-8.
 */
const JSONManager: CacheValueManager<Record<string, any>> = {
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

export default JSONManager;
