import type { CacheValueManager } from "./cache_managers";
import type { IStore } from "./store";

export type RawCache<Type> = Record<string, NullableCacheValue<Type>>;
export type NullableCacheValue<Type> = Type | undefined;
export type CacheObj<Type> = Record<string, Type>;
export type RawCacheEntry<Type> = [string, Type];
export type RawCachePair<Type> = { key: string; value: Type };

export enum CacheSetResult {
  SET,
  UPDATE,
}

export interface ICache<Type> {
  max_size: number;

  readonly ready: boolean;

  delete(key: string, include_store?: boolean): Promise<boolean>;

  set(key: string, value: Type): Promise<CacheSetResult>;

  get(key: string): Promise<NullableCacheValue<Type>>;

  loadFromStore(): Promise<void>;

  flushToStore(): Promise<void>;

  /**
   * @param sync_with_store default: `false`
   */
  update(
    key: string,
    new_value: NonNullable<Type>,
    sync_with_store?: boolean
  ): Promise<boolean>;

  save(keys: string[] | "all"): Promise<void>;

  /**
   * @param include_store default: `false`
   */
  has(key: string, include_store?: boolean): boolean;
}

export interface NewCacheArgs<Type> {
  max_size: number;
  store: IStore;
  value_manager: CacheValueManager<Type>;
}

export default class Cache<Type>
  implements ICache<Type>, Omit<Map<string, Type>, "delete" | "set" | "get">
{
  //#region MAP BINDINGS

  clear() {
    this.__map.clear();
  }

  entries() {
    return this.__map.entries();
  }

  forEach(
    callbackfn: (value: Type, key: string, map: Map<string, Type>) => void,
    thisArg?: any
  ) {
    this.__map.forEach(callbackfn, thisArg);
  }

  keys() {
    return this.__map.keys();
  }

  get size() {
    return this.__map.size;
  }

  values() {
    return this.__map.values();
  }

  [Symbol.iterator]() {
    return this.__map[Symbol.iterator]();
  }

  [Symbol.toStringTag] = "Cache";

  //#endregion MAP BINDINGS

  private __map: Map<string, Type> = new Map();
  store: IStore;
  max_size: number;
  value_manager: CacheValueManager<Type>;

  constructor(args: NewCacheArgs<Type>) {
    this.store = args.store;
    this.max_size = args.max_size;
    this.value_manager = args.value_manager;
  }

  get ready() {
    return this.store.ready;
  }

  async delete(key: string, include_store?: boolean) {
    const deleted = this.__map.delete(key);

    if (include_store) await this.store.delete(key);

    return deleted;
  }

  async set(key: string, value: Type) {
    const valueTest = this.value_manager.test(value);

    if (typeof key !== "string" || !valueTest.pass) {
      const errorMsg = valueTest.failReason || "Invalid Cache key/value";

      throw new TypeError(errorMsg);
    }

    if (await this.update(key, value)) {
      return CacheSetResult.UPDATE;
    }

    const keys = Array.from(this.keys());

    if (keys.length > 0 && keys.length >= this.max_size) {
      const last_key = keys.shift()!;

      const last_key_value = this.__map.get(last_key);

      if (last_key_value)
        await this.store.insert([
          {
            key: last_key,
            value: this.value_manager.bake(last_key_value),
          },
        ]);

      this.__map.delete(last_key);
    }

    this.__map.set(key, value);

    return CacheSetResult.SET;
  }

  async get(key: string) {
    if (typeof key !== "string") {
      throw new TypeError("Cache only accepts string keys");
    }

    const value_in_cache = this.__map.get(key);

    if (value_in_cache) {
      return value_in_cache;
    }

    const fileCachePath = this.store.check(key);

    const retrieved_value = fileCachePath
      ? await this.value_manager.revive({
          buffer: () => this.store.retrieve(key) as Promise<Buffer>,
          fileCachePath,
        })
      : undefined;

    if (retrieved_value) await this.set(key, retrieved_value);

    return retrieved_value;
  }

  async loadFromStore() {
    const new_cache_entries = await this.store.load(this.max_size);

    for (const [key, value] of new_cache_entries) {
      await this.set(
        key,
        await this.value_manager.revive({ buffer: () => value })
      );
    }
  }

  async flushToStore() {
    const pKeys = Array.from(this.entries());

    this.clear();

    await this.store.insert(
      pKeys.map(([key, value]) => ({
        key: key,
        value: this.value_manager.bake(value),
      }))
    );
  }

  /**
   * @param sync_with_store default: `false`
   */
  async update(key: string, new_value: Type, sync_with_store = false) {
    const valueTest = this.value_manager.test(new_value);

    if (typeof key !== "string" || !valueTest.pass) {
      const errorMsg = valueTest.failReason || "Invalid Cache key/value";

      throw new TypeError(errorMsg);
    }

    if (!this.has(key, sync_with_store)) {
      return false;
    }

    this.__map.set(key, new_value);

    if (sync_with_store)
      await this.store.insert([
        { key, value: this.value_manager.bake(new_value) },
      ]);

    return true;
  }

  async save(keys: string[] | "all") {
    if (keys === "all") {
      keys = Array.from(this.keys());
    }

    for (const key of keys) {
      const value = await this.get(key);

      if (!value) continue;

      await this.store.insert([
        {
          key,
          value: this.value_manager.bake(value),
        },
      ]);
    }
  }

  /**
   * @param include_store default: `false`
   * @param type default `'key'`
   */
  has(key: string, include_store = false) {
    if (typeof key !== "string")
      throw new TypeError("Cache only accepts string keys");

    return this.__map.has(key) || (include_store && !!this.store.check(key));
  }
}
