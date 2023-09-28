import path from "path";
import Cache, { type ICache } from "./cache";
import Store from "./store";
import { CacheValueStringManager } from "./cache_managers";

export interface NewBidirectionalCacheArgs {
  max_size: number;
  root_store_path: string;
}

export default class BidirectionalCache implements ICache<string> {
  protected __key_cache = new Cache({
    max_size: 0,
    store: new Store(),
    value_manager: CacheValueStringManager,
  });

  protected __value_cache = new Cache({
    max_size: 0,
    store: new Store(),
    value_manager: CacheValueStringManager,
  });

  root_store_path: string;

  set max_size(n: number) {
    this.__key_cache.max_size = n;
    this.__value_cache.max_size = n;
  }

  get max_size() {
    return this.__key_cache.max_size;
  }

  get size() {
    return this.__key_cache.size;
  }

  get ready() {
    return this.__key_cache.store.ready && this.__value_cache.store.ready;
  }

  constructor(args: NewBidirectionalCacheArgs) {
    this.max_size = args.max_size;
    this.root_store_path = args.root_store_path;
  }

  async setup(clean?: boolean) {
    this.root_store_path = path.resolve(this.root_store_path);

    await this.__key_cache.store.setup(
      path.resolve(this.root_store_path, ".keys"),
      clean
    );

    await this.__value_cache.store.setup(
      path.resolve(this.root_store_path, ".values"),
      clean
    );
  }

  all() {
    return {
      keys: Array.from(this.__key_cache.keys()),
      values: Array.from(this.__value_cache.keys()),
    };
  }

  getByKey(key: string) {
    return this.__key_cache.get(key);
  }

  getByValue(value: string) {
    return this.__value_cache.get(value);
  }

  async loadFromStore() {
    await this.__key_cache.loadFromStore();
    await this.__value_cache.loadFromStore();
  }

  async set(key: string, value: string) {
    const result = await this.__key_cache.set(key, value);
    await this.__value_cache.set(value, key);

    return result;
  }

  async save(keys: "all" | string[]) {
    if (keys === "all") {
      await this.__key_cache.save("all");
      await this.__value_cache.save("all");

      return;
    }

    for (const key of keys) {
      const current_value = await this.__key_cache.get(key);

      if (current_value) await this.__value_cache.save([current_value]);

      await this.__key_cache.save([key]);
    }
  }

  async update(key: string, new_value: string, sync_with_store?: boolean) {
    const old_value = await this.__key_cache.get(key);

    const key_update = await this.__key_cache.update(
      key,
      new_value,
      sync_with_store
    );

    if (!key_update) return false;

    if (old_value) await this.__value_cache.delete(old_value, sync_with_store);

    await this.__value_cache.set(new_value, key);

    return true;
  }

  async get(key_or_value: string) {
    return (
      (await this.__key_cache.get(key_or_value)) ||
      (await this.__value_cache.get(key_or_value))
    );
  }

  has(key_or_value: string, include_store?: boolean) {
    return (
      this.__key_cache.has(key_or_value, include_store) ||
      this.__value_cache.has(key_or_value, include_store)
    );
  }

  hasKey(key: string, include_store?: boolean) {
    return this.__key_cache.has(key, include_store);
  }

  hasValue(value: string, include_store?: boolean) {
    return this.__value_cache.has(value, include_store);
  }

  async delete(key: string, include_store?: boolean) {
    const current_value = await this.__key_cache.get(key);

    let value_deleted = false;
    let key_deleted = false;

    if (current_value) {
      value_deleted = await this.__value_cache.delete(
        current_value,
        include_store
      );
    }

    key_deleted = await this.__key_cache.delete(key, include_store);

    return key_deleted && value_deleted;
  }

  async flushToStore() {
    await this.__key_cache.flushToStore();
    await this.__value_cache.flushToStore();
  }
}
