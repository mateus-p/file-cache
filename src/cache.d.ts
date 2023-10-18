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

export declare interface ICache<Type> {
  max_size: number;

  /**
   * Cache is ready to use
   */
  readonly ready: boolean;

  /**
   * @param include_store delete `key` in store
   * @returns `deleted_from_map || (include_store && deleted_from_store)`
   */
  delete(key: Key, include_store?: boolean): Promise<boolean>;

  /**
   * Adds a new element with a specified key and value to the Cache.
   * If an element with the same key already exists, the element will be updated.
   * If the insertion of the element makes the cache larger than `max_size`, the first pushed element is flushed to store.
   * If a string key is passed, a new `Key` instance will be generated.
   */
  set(key: string | Key, value: Type): Promise<Key>;

  /**
   * Get value by key.
   * @param include_store if `key` is not found in the cache, then search the store.
   * If found in the store, automatically load it into the cache.
   */
  get(key: Key, include_store?: boolean): Promise<NullableCacheValue<Type>>;

  /**
   * Get key metadata. Only works if `key` has already been stored at some point.
   */
  getMeta(key: Key): Promise<Metadata | undefined>;

  /**
   * Load items from the store, in reverse chronological order, limited by `max_size`.
   */
  loadFromStore(): Promise<void>;

  /**
   * Insert all items into the store, then clear the cache.
   */
  flushToStore(): Promise<void>;

  /**
   * Insert items into the store.
   */
  save(keys: Key[] | "all"): Promise<void>;

  /**
   * @param include_store if `key` is not found in the cache, then search the store.
   */
  has(key: Key, include_store?: boolean): boolean;

  /**
   * Expose [`docs/Store#query`](./Store.html#query)
   *
   * Expose [`Store#query`](./store.ts)
   */
  readonly storeQuery: QueryBind<MetadataSource, Metadata>;

  /**
   * Utility to query through map keys
   */
  query: QueryBind<Key>;
}

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
  implements ICache<Type>, CacheMap<Type>
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

  query: QueryBind<Key>;

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

  readonly storeQuery: QueryBind<MetadataSource, Metadata>;

  readonly ready: Ready;

  static start<Type>(
    args: { store: { dest: string; clean?: boolean } } & Omit<
      NewCacheArgs<Type, boolean>,
      "store"
    >
  ): Promise<Cache<Type, true>>;
}
