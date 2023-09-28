import type {
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodNull,
  ZodArray,
  ZodObject,
  TypeOf,
} from "zod";
import { CacheValueManager } from "./types";
import { serialize, deserialize } from "v8";

type ZodSerializable =
  | ZodString
  | ZodNumber
  | ZodBoolean
  | ZodNull
  | ZodArray<ZodSerializable | ZodObject<ZodSerializableObject>>;

type ZodSerializableObject = {
  [key: string]: ZodSerializable | ZodObject<ZodSerializableObject>;
};

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
        failReason: !parsed.success ? parsed.error.message : undefined,
      };
    },
  };
}
