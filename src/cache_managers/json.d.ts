import { CacheValueManager } from "./types";

export declare type JSONManager = CacheValueManager<Record<string, any>>;

/**
 * This value manager handles JSON string cache values, formatted in UTF-8.
 */
export declare const JSONManager: CacheValueManager<Record<string, any>>;
