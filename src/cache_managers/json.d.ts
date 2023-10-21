import { CacheValueManager } from "./types";

export declare type JSONCompatiblePrimitives = string | number | null | boolean;

export declare type JSONCompatibleObject = {
  [key: string]: JSONCompatiblePrimitives | JSONCompatibleObject;
};

export declare type JSONManager = CacheValueManager<
  JSONCompatiblePrimitives | JSONCompatibleObject
>;

/**
 * This value manager handles JSON string cache values, formatted in UTF-8.
 */
export declare const JSONManager: JSONManager;
