export * from "./cache";
export { Store } from "./store";
export * as Util from "./util";
export * from "./key";
export * from "./meta";
export * from "./query";

export * from "./cache_managers/types";
export type * from "./cache_managers/json";
export type * from "./cache_managers/string";
export type * from "./cache_managers/zod";

import { JSONManager } from "./cache_managers/json";
import { StringManager } from "./cache_managers/string";
import { createZodManager } from "./cache_managers/zod";

export declare const CacheManagers: {
  JSON: typeof JSONManager;
  String: typeof StringManager;
  Zod: typeof createZodManager;
};
