const $key = require("./key");
const store = require("./store");
const query = require("./query");

/**
 * @template Type
 * @template {boolean} Ready
 */
class Cache {
  //#region MAP BINDINGS

  clear() {
    this.#map.clear();
  }

  entries() {
    return this.#map.entries();
  }

  forEach(callbackfn, thisArg) {
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

  /**
   * @type {Map<$key.Key, Type>}
   */
  #map = new Map();

  /**
   * @type {store.Store<Ready>}
   */
  #store = null;

  /**
   * @type {import('./cache_managers/types').CacheValueManager<Type>}
   */
  #value_manager = null;

  query = query.bindQuery({
    iterator: () => this.#map.keys(),
    transformer: (key) => ({ key, value: this.get(key) }),
  });

  /**
   *
   * @param {import('./cache').NewCacheArgs<Type, Ready>} args
   */
  constructor(args) {
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

  /**
   *
   * @param {$key.Key} key
   * @param {boolean} [include_store]
   */
  async delete(key, include_store) {
    const deleted = this.#map.delete(key);
    let deleted_from_store = false;

    if (include_store) deleted_from_store = await this.#store.delete(key);

    return deleted || deleted_from_store;
  }

  /**
   * @param {string | $key.Key} key
   * @param {Type} value
   * @returns {Promise<$key.Key>}
   */
  async set(key, value) {
    const valueTest = this.#value_manager.test(value);

    if (!(key instanceof $key.Key)) {
      if (typeof key != "string") throw new TypeError("Invalid Cache key");

      key = new $key.Key(key);
    }

    if (!valueTest.pass) {
      const errorMsg = valueTest.failReason || "Invalid Cache value";

      throw new TypeError(errorMsg);
    }

    const keys = Array.from(this.keys());

    if (keys.length > 0 && keys.length >= this.max_size) {
      const last_key = keys.shift();

      const last_key_value = this.#map.get(last_key);

      if (last_key_value) {
        await this.#store.insert([
          {
            key: last_key,
            value: this.#value_manager.toBuffer(last_key_value),
          },
        ]);
      }

      this.#map.delete(last_key);
    }

    this.#map.set(key, value);

    return key;
  }

  /**
   * @param {$key.Key} key
   * @param {boolean} [include_store]
   */
  async get(key, include_store) {
    if (!(key instanceof $key.Key)) {
      throw new TypeError("Cache only accepts 'Key' keys");
    }

    const value_in_cache = this.#map.get(key);

    if (value_in_cache) {
      return value_in_cache;
    }

    if (!include_store) return;

    const fileCachePath = this.#store.check(key);

    const retrieved_value = fileCachePath
      ? await this.#value_manager.fromBuffer(this.#store.retrieve(key))
      : undefined;

    if (retrieved_value) await this.set(key, retrieved_value);

    return retrieved_value;
  }

  /**
   * @param {$key.Key} key
   */
  getMeta(key) {
    return this.#store.retrieveMeta(key);
  }

  async loadFromStore() {
    const new_cache_entries = await this.#store.load(this.max_size);

    for (const [key, value] of new_cache_entries) {
      await this.set(key, this.#value_manager.fromBuffer(value));
    }
  }

  async flushToStore() {
    const pKeys = Array.from(this.entries());

    this.clear();

    await this.#store.insert(
      pKeys.map(([key, value]) => ({
        key,
        value: this.#value_manager.toBuffer(value),
      }))
    );
  }

  /**
   * @param {$key.Key[] | "all"} keys
   */
  async save(keys) {
    if (keys === "all") {
      keys = Array.from(this.keys());
    }

    /**
     * @type {import('./cache').RawCachePair<Buffer>[]}
     */
    const pairs = [];

    for (const key of keys) {
      const value = await this.get(key);

      if (!value) continue;

      pairs.push({
        key,
        value: this.#value_manager.toBuffer(value),
      });
    }

    await this.#store.insert(pairs);
  }

  /**
   * @param {key.Key} key
   * @param {boolean} [include_store]
   */
  has(key, include_store) {
    if (typeof key !== "string")
      throw new TypeError("Cache only accepts string keys");

    return (
      this.#map.has(key) ||
      (include_store && typeof this.#store.check(key) == "string")
    );
  }

  /**
   * Create new, ready to use, Cache instance
   *
   * @template Type
   * @param {{ store: { dest: string, clean?: boolean } } & Omit<import('./cache').NewCacheArgs<Type, boolean>, "store">} args
   */
  static async start(args) {
    const n_store = await store.Store.start(args.store.dest, args.store.clean);

    const cache = new this({
      max_size: args.max_size,
      store: n_store,
      value_manager: args.value_manager,
    });

    return cache;
  }
}

module.exports.Cache = Cache;
