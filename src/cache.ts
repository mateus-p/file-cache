import type { CacheValueManager } from "./cache_managers/types";
import type { Metadata, MetadataSource } from "./meta";
import { Key } from "./key";
import { Store, IStore } from "./store";
import { QueryBind, bindQuery } from "./query";

export type RawCache<Type> = Record<string, NullableCacheValue<Type>>;
export type NullableCacheValue<Type> = Type | undefined;
export type CacheObj<Type> = Record<string, Type>;
export type RawCacheEntry<Type> = [Key, Type];
export type RawCachePair<Type> = { key: Key; value: Type };

export interface ICache<Type> {
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

export interface NewCacheArgs<Type, Ready extends boolean> {
  max_size: number;
  store: IStore<Ready>;
  value_manager: CacheValueManager<Type>;
}

export type CacheMap<Type> = Omit<Map<Key, Type>, "delete" | "set" | "get">;

export class Cache<Type, Ready extends boolean = false>
  implements ICache<Type>, CacheMap<Type>
{
  //#region MAP BINDINGS

  clear() {
    this.#map.clear();
  }

  entries() {
    return this.#map.entries();
  }

  forEach(
    callbackfn: (value: Type, key: Key, map: Map<Key, Type>) => void,
    thisArg?: any
  ) {
    this.#map.forEach(callbackfn, thisArg);
  }

  keys() {
    return this.#map.keys();
  }

  get size() {
    return this.#map.size;
  }

  values() {
    return this.#map.values();
  }

  [Symbol.iterator]() {
    return this.#map[Symbol.iterator]();
  }

  [Symbol.toStringTag] = "Cache";

  //#endregion MAP BINDINGS

  #map = new Map<Key, Type>();
  #store: IStore<Ready>;
  #value_manager: CacheValueManager<Type>;
  max_size: number;

  query = bindQuery({
    iterator: () => this.#map.keys(),
  });

  constructor(args: NewCacheArgs<Type, Ready>) {
    this.#store = args.store;
    this.#value_manager = args.value_manager;
    this.max_size = args.max_size;
  }

  get storeQuery() {
    return this.#store.query;
  }

  get ready() {
    return this.#store.ready;
  }

  async delete(key: Key, include_store?: boolean) {
    const deleted = this.#map.delete(key);
    let deleted_from_store = false;

    if (include_store) deleted_from_store = await this.#store.delete(key);

    return deleted || deleted_from_store;
  }

  async set(key: string | Key, value: Type) {
    const valueTest = this.#value_manager.test(value);

    if (!(key instanceof Key)) {
      if (typeof key !== "string") throw new TypeError("Invalid Cache key");

      key = new Key(key);
    }

    if (!valueTest.pass) {
      const errorMsg = valueTest.failReason || "Invalid Cache value";

      throw new TypeError(errorMsg);
    }

    const keys = Array.from(this.keys());

    if (keys.length > 0 && keys.length >= this.max_size) {
      const last_key = keys.shift()!;

      const last_key_value = this.#map.get(last_key);

      if (last_key_value) {
        await this.#store.insert([
          {
            key: last_key,
            value: this.#value_manager.bake(last_key_value),
          },
        ]);
      }

      this.#map.delete(last_key);
    }

    this.#map.set(key, value);

    return key;
  }

  async get(key: Key, include_store?: boolean) {
    if (!(key instanceof Key)) {
      throw new TypeError("Cache only accepts 'Key' keys");
    }

    const value_in_cache = this.#map.get(key);

    if (value_in_cache) {
      return value_in_cache;
    }

    if (!include_store) return;

    const fileCachePath = this.#store.check(key);

    const retrieved_value = fileCachePath
      ? await this.#value_manager.revive({
          buffer: () => this.#store.retrieve(key) as Promise<Buffer>,
          fileCachePath,
        })
      : undefined;

    if (retrieved_value) await this.set(key, retrieved_value);

    return retrieved_value;
  }

  getMeta(key: Key) {
    return this.#store.retrieveMeta(key);
  }

  async loadFromStore() {
    const new_cache_entries = await this.#store.load(this.max_size);

    for (const [key, value] of new_cache_entries) {
      await this.set(
        key,
        await this.#value_manager.revive({ buffer: () => value })
      );
    }
  }

  async flushToStore() {
    const pKeys = Array.from(this.entries());

    this.clear();

    await this.#store.insert(
      pKeys.map(([key, value]) => ({
        key: key,
        value: this.#value_manager.bake(value),
      }))
    );
  }

  async save(keys: Key[] | "all") {
    if (keys === "all") {
      keys = Array.from(this.keys());
    }

    const pairs: RawCachePair<Buffer>[] = [];

    for (const key of keys) {
      const value = await this.get(key);

      if (!value) continue;

      pairs.push({
        key,
        value: this.#value_manager.bake(value),
      });
    }

    await this.#store.insert(pairs);
  }

  has(key: Key, include_store = false) {
    if (typeof key !== "string")
      throw new TypeError("Cache only accepts string keys");

    return (
      this.#map.has(key) ||
      (include_store && typeof this.#store.check(key) == "string")
    );
  }

  /**
   * Create new, ready to use, Cache instance
   */
  static async start<Type>(
    args: { store: { dest: string; clean?: boolean } } & Omit<
      NewCacheArgs<Type, boolean>,
      "store"
    >
  ) {
    const store = await Store.start(args.store.dest, args.store.clean);

    const cache = new this({
      max_size: args.max_size,
      store,
      value_manager: args.value_manager,
    });

    return cache;
  }
}
