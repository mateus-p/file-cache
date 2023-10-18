import { z } from "zod";
import { CacheValueManager } from "./types";

export declare type ZodSerializable =
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodNull
  | z.ZodUndefined
  | z.ZodBigInt
  | z.ZodOptional<ZodSerializable>
  | z.ZodNullable<ZodSerializable>
  | z.ZodArray<ZodSerializable | z.ZodObject<ZodSerializableObject>>;

export declare type ZodSerializableObject = {
  [key: string]: ZodSerializable | z.ZodObject<ZodSerializableObject>;
};

export declare type ZodManager<
  Type extends ZodSerializable | z.ZodObject<ZodSerializableObject>
> = CacheValueManager<z.infer<Type>> & {
  zodTest: (value: any) => z.SafeParseReturnType<z.infer<Type>, z.infer<Type>>;
};

/**
 * @requires [zod](https://github.com/colinhacks/zod)
 *
 * Powered by `node:v8` and `zod` (as a peer dependency, please install it if you use it), with this value manager it is possible to save any serializable object, as well as perform type checking at runtime
 *
 * @example
 * import { CacheManagers } from "@mateus-pires/file-cache";
 * import z from "zod";
 *
 * const ZodManager = CacheManagers.Zod(
 *  z.object({ a: z.string().optional(), b: z.number() })
 * );
 *
 * // cache: Cache<{ a?: string; b: number }>
 * const cache = new Cache({ value_manager: ZodManager });
 */
export declare function createZodManager<
  Type extends ZodSerializable | z.ZodObject<ZodSerializableObject>
>(obj: Type): ZodManager<Type>;
