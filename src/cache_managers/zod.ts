import type {
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodNull,
  ZodArray,
  ZodObject,
  ZodBigInt,
  ZodUndefined,
  TypeOf,
} from "zod";
import { CacheValueManager } from "./types";
import { serialize, deserialize } from "v8";

export type ZodSerializable =
  | ZodString
  | ZodNumber
  | ZodBoolean
  | ZodNull
  | ZodUndefined
  | ZodBigInt
  | ZodArray<ZodSerializable | ZodObject<ZodSerializableObject>>;

export type ZodSerializableObject = {
  [key: string]: ZodSerializable | ZodObject<ZodSerializableObject>;
};

/**
 * @requires [zod](https://github.com/colinhacks/zod)
 *
 * Powered by `node:v8` and `zod` (as a peer dependency, please install it if you use it), with this value manager it is possible to save any serializable object, as well as perform type checking at runtime
 *
 * @example
 * import { CacheManagers } from "@mateus-pires/file-cache/cache_managers/zod";
 * import z from "zod";
 *
 * const ZodManager = CacheManagers.Zod(
 *  z.object({ a: z.string().optional(), b: z.number() })
 * );
 *
 * // cache: Cache<{ a?: string; b: number }>
 * const cache = new Cache({ value_manager: ZodManager });
 */
export default function createZodManager<
  Type extends ZodSerializable | ZodObject<ZodSerializableObject>
>(obj: Type): CacheValueManager<TypeOf<Type>> {
  return {
    bake: (value) => serialize(value),
    revive: async ({ buffer }) => {
      return deserialize(await buffer());
    },
    test: (value) => {
      const parsed = obj.safeParse(value);

      return {
        pass: parsed.success,
        failReason: !parsed.success ? parsed.error.toString() : undefined,
      };
    },
  };
}
