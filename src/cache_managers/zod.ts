import type { z } from "zod";
import { CacheValueManager } from "./types";
import { serialize, deserialize } from "v8";
import { inspect } from "util";

export type ZodSerializable =
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodNull
  | z.ZodUndefined
  | z.ZodBigInt
  | z.ZodOptional<ZodSerializable>
  | z.ZodNullable<ZodSerializable>
  | z.ZodArray<ZodSerializable | z.ZodObject<ZodSerializableObject>>;

export type ZodSerializableObject = {
  [key: string]: ZodSerializable | z.ZodObject<ZodSerializableObject>;
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
export default function createZodManager<
  Type extends ZodSerializable | z.ZodObject<ZodSerializableObject>
>(
  obj: Type
): CacheValueManager<z.infer<Type>> & {
  zodTest: (value: any) => z.SafeParseReturnType<z.infer<Type>, z.infer<Type>>;
} {
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
