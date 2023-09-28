import type {
  ZodArray,
  ZodBoolean,
  ZodNull,
  ZodNumber,
  ZodObject,
  ZodString,
  ZodType,
  infer as zodInfer,
} from "zod";
import { serialize, deserialize } from "v8";

export interface CacheValueManager<Type> {
  revive(args: {
    fileCachePath?: string;
    buffer: () => Promise<Buffer> | Buffer;
  }): Promise<Type> | Type;

  test(value: any): { pass: boolean; failReason?: string };

  bake(value: Type): Buffer;
}

export const CacheValueStringManager: CacheValueManager<string> = {
  revive: async ({ buffer }) => {
    return (await buffer()).toString();
  },
  bake: (value) => Buffer.from(value, "utf-8"),
  test: (value) => ({
    pass: typeof value == "string",
    failReason: typeof value != "string" ? "value is not a string" : undefined,
  }),
};

type ZodSerializable =
  | ZodString
  | ZodNumber
  | ZodBoolean
  | ZodNull
  | ZodArray<ZodSerializable | ZodObject<ZodSerializableObject>>;

type ZodSerializableObject = {
  [key: string]: ZodSerializable | ZodObject<ZodSerializableObject>;
};

export function createCacheValueZodManager<
  Type extends ZodSerializable | ZodObject<ZodSerializableObject>
>(obj: Type): CacheValueManager<zodInfer<Type>> {
  return {
    bake: (value) => serialize(value),
    revive: async ({ buffer }) => {
      return deserialize(await buffer());
    },
    test: (value) => {
      const parsed = obj.safeParse(value);

      return {
        pass: parsed.success,
        failReason: !parsed.success ? parsed.error.message : undefined,
      };
    },
  };
}
