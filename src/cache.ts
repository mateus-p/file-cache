import { IStore } from "./store";

export type CacheValue = string;
export type RawCache = Record<string, NullableCacheValue>;
export type NullableCacheValue = CacheValue | undefined;
export type CacheObj = Record<string, CacheValue>;
export type RawCacheEntry = [string, CacheValue];
export type RawCachePair = { key: string; value: CacheValue };

export interface ICache {
  max_size: number;

  readonly ready: boolean;

  delete(key: string, include_store?: boolean): Promise<boolean>;

  set(key: string, value: string): Promise<void>;

  get(key: string): Promise<NullableCacheValue>;

  loadFromStore(): Promise<void>;

  flushToStore(): Promise<void>;

  /**
   * @param sync_with_store default: `false`
   */
  update(
    key: string,
    new_value: NonNullable<CacheValue>,
    sync_with_store?: boolean
  ): Promise<boolean>;

  save(keys: string[] | true): Promise<void>;

  /**
   * @param include_store default: `false`
   */
  has(key: string, include_store?: boolean): boolean;
}

export default class Cache
  implements ICache, Omit<Map<string, CacheValue>, "delete" | "set" | "get">
{
  private __map: Map<string, string> = new Map();

  get ready() {
    return this.store.ready;
  }

  //#region MAP BINDINGS

  clear() {
    this.__map.clear();
  }

  entries() {
    return this.__map.entries();
  }

  forEach(
    callbackfn: (value: string, key: string, map: Map<string, string>) => void,
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

  constructor(public max_size: number, public store: IStore) {}

  async delete(key: string, include_store?: boolean) {
    const deleted = this.__map.delete(key);

    if (include_store) await this.store.delete(key);

    return deleted;
  }

  async set(key: string, value: string) {
    if (typeof key !== "string" || typeof value !== "string") {
      throw new TypeError("Cache only accepts string keys/values");
    }

    if (await this.update(key, value)) {
      return;
    }

    const keys = Array.from(this.keys());

    if (keys.length > 0 && keys.length >= this.max_size) {
      const last_key = keys.shift()!;

      const last_key_value = this.__map.get(last_key);

      if (last_key_value)
        await this.store.insert([
          {
            key: last_key,
            value: last_key_value,
          },
        ]);

      this.__map.delete(last_key);
    }

    this.__map.set(key, value);

    return;
  }

  async get(key: string) {
    if (typeof key !== "string") {
      throw new TypeError("Cache only accepts string keys/values");
    }

    const value_in_cache = this.__map.get(key);

    if (value_in_cache) {
      return value_in_cache;
    }

    const retrieved_value = await this.store.retrieve(key);

    if (retrieved_value) this.set(key, retrieved_value);

    return retrieved_value;
  }

  async loadFromStore() {
    const new_cache_entries = await this.store.load(this.max_size);

    for (const [key, value] of new_cache_entries) {
      await this.set(key, value);
    }
  }

  async flushToStore() {
    const pKeys = Array.from(this.entries());

    this.clear();

    await this.store.insert(
      pKeys.map(([key, value]) => ({
        key: key,
        value: value,
      }))
    );
  }

  /**
   * @param sync_with_store default: `false`
   */
  async update(
    key: string,
    new_value: NonNullable<CacheValue>,
    sync_with_store = false
  ) {
    if (typeof key !== "string" || typeof new_value !== "string") {
      throw new TypeError("Cache only accepts string keys/values");
    }

    if (!this.has(key, sync_with_store)) {
      return false;
    }

    this.__map.set(key, new_value);

    if (sync_with_store) await this.store.insert([{ key, value: new_value }]);

    return true;
  }

  async save(keys: string[] | true) {
    if (keys === true) {
      keys = Array.from(this.keys());
    }

    for (const key of keys) {
      const value = await this.get(key);

      if (!value) continue;

      await this.store.insert([
        {
          key,
          value,
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
      throw new TypeError("Cache only accepts string keys/values");

    return this.__map.has(key) || (include_store && !!this.store.check(key));
  }
}
