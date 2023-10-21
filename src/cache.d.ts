import type { CacheValueManager } from "./cache_managers/types";
import type { Metadata, MetadataSource } from "./meta";
import { Key } from "./key";
import { Store } from "./store";
import { QueryBind } from "./query";

export declare type RawCache<Type> = Record<string, NullableCacheValue<Type>>;
export declare type NullableCacheValue<Type> = Type | undefined;
export declare type CacheObj<Type> = Record<string, Type>;
export declare type RawCacheEntry<Type> = [Key, Type];
export declare type RawCachePair<Type> = { key: Key; value: Type };

export declare interface NewCacheArgs<Type, Ready extends boolean> {
  max_size: number;
  store: Store<Ready>;
  value_manager: CacheValueManager<Type>;
}

export declare type CacheMap<Type> = Omit<
  Map<Key, Type>,
  "delete" | "set" | "get"
>;

export declare class Cache<Type, Ready extends boolean = false>
  implements CacheMap<Type>
{
  //#region MAP BINDINGS

  clear(): void;

  entries(): IterableIterator<[Key, Type]>;

  forEach(
    callbackfn: (value: Type, key: Key, map: Map<Key, Type>) => void,
    thisArg?: any
  ): void;

  keys(): IterableIterator<Key>;

  readonly size: number;

  values(): IterableIterator<Type>;

  [Symbol.iterator](): IterableIterator<[Key, Type]>;

  [Symbol.toStringTag]: "Cache";

  //#endregion MAP BINDINGS

  max_size: number;

  query: QueryBind<Key, { key: Key; value: Promise<Type> }>;

  readonly storeQuery: Store<boolean>["query"];

  constructor(args: NewCacheArgs<Type, Ready>);

  delete(key: Key, include_store?: boolean | undefined): Promise<boolean>;

  set(key: string | Key, value: Type): Promise<Key>;

  get(
    key: Key,
    include_store?: boolean | undefined
  ): Promise<NullableCacheValue<Type>>;

  getMeta(key: Key): Promise<Metadata | undefined>;

  loadFromStore(): Promise<void>;

  flushToStore(): Promise<void>;

  save(keys: Key[] | "all"): Promise<void>;

  has(key: Key, include_store?: boolean | undefined): boolean;

  readonly ready: Ready;

  static start<Type>(
    args: { store: { dest: string; clean?: boolean } } & Omit<
      NewCacheArgs<Type, boolean>,
      "store"
    >
  ): Promise<Cache<Type, true>>;
}
