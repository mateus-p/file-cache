const { existsSync } = require("fs");
const { rm, mkdir, readFile, writeFile } = require("fs/promises");
const v8 = require("v8");
const path = require("path");
const { globIterate } = require("glob");
const meta = require("./meta");
const query = require("./query");

const skip_check_symbol = Symbol("store.skip_check");
const meta_symbol = Symbol("store.meta");
const meta_key = ".meta";
const all_meta_pattern = `*${meta_key}`;

class Store {
  #ready = false;

  /**
   * @type {string | undefined}
   */
  dest = undefined;

  query = query.bindQuery({
    asyncIterator: () => this[Symbol.asyncIterator](),
  });

  get ready() {
    return this.#ready;
  }

  constructor() {
    this[Symbol.asyncIterator] = async function* iterator() {
      if (!this.dest) throw new Error("Cannot iterate before setup");

      const glob = globIterate(all_meta_pattern, { cwd: this.dest });

      for await (const match of glob) {
        yield meta.Metadata.fromBuffer(
          await readFile(path.resolve(this.dest, match))
        );
      }
    };
  }

  async reset() {
    if (!this.dest) {
      throw new Error("Cannot reset before setup");
    }

    await rm(this.dest, { recursive: true, force: true });

    await mkdir(this.dest);
  }

  /**
   * @param {key.Key} key
   */
  async delete(key) {
    if (!this.dest) {
      throw new Error("Cannot delete before setup");
    }

    const file = path.resolve(this.dest, key.id);

    if (!existsSync(file)) {
      return false;
    }

    await rm(file);

    await rm(file + meta_key);

    return true;
  }

  /**
   * @param {key.Key} key
   * @param {symbol} [__meta]
   */
  check(key, __meta) {
    if (!this.dest) {
      throw new Error("Cannot check before setup");
    }

    const file = path.resolve(
      this.dest,
      __meta === meta_symbol ? key.id + meta_key : key.id
    );

    const result = existsSync(file) ? file : false;

    return result;
  }

  /**
   *
   * @param {string} dest
   * @param {boolean} [clean]
   * @returns {Promise<Store<true>>}
   */
  async setup(dest, clean) {
    // @ts-ignore
    this.dest = path.resolve(dest);

    if (clean) await rm(this.dest, { force: true, recursive: true });

    if (!existsSync(this.dest)) await mkdir(this.dest, { recursive: true });

    // @ts-ignore
    this.#ready = true;

    return this;
  }

  /**
   *
   * @param {key.Key} key
   * @param {symbol} [__skip_check]
   */
  async retrieve(key, __skip_check) {
    if (!this.dest) {
      throw new Error("Cannot retrieve before setup");
    }

    const file =
      __skip_check === skip_check_symbol
        ? path.resolve(this.dest, key.id)
        : this.check(key);

    if (!file) {
      return undefined;
    }

    const buf = await readFile(file);

    return buf;
  }

  /**
   *
   * @param {key.Key} key
   * @param {symbol} [_skip_check]
   */
  async retrieveMeta(key, _skip_check) {
    if (!this.dest) {
      throw new Error("Cannot retrieve before setup");
    }

    const file =
      _skip_check === skip_check_symbol
        ? path.resolve(this.dest, key.id + meta_key)
        : this.check(key, meta_symbol);

    if (!file) {
      return undefined;
    }

    const buf = await readFile(file);

    return meta.Metadata.fromSource(v8.deserialize(buf));
  }

  /**
   *
   * @param {import('./cache').RawCachePair<Buffer>[]} pairs
   */
  async insert(pairs) {
    if (!this.dest) {
      throw new Error("Cannot insert before setup");
    }

    for (const pair of pairs) {
      const r_meta =
        (await this.retrieveMeta(pair.key)) || new meta.Metadata(pair.key);

      r_meta.touch();

      await writeFile(path.resolve(this.dest, pair.key.id), pair.value);

      await writeFile(
        path.resolve(this.dest, pair.key.id + meta_key),
        v8.serialize(r_meta.toSource())
      );
    }
  }

  /**
   * @param {number} size
   * @returns {Promise<import('./cache').RawCacheEntry<Buffer>[]>}
   */
  async load(size) {
    const meta = await this.loadMeta(size);

    return Promise.all(
      meta.map(async (m) => {
        return [m.key, await this.retrieve(m.key, skip_check_symbol)];
      })
    );
  }

  async loadMeta(size = 0) {
    if (!this.dest) {
      throw new Error("Cannot load before setup");
    }

    /**
     * @type {meta.Metadata[]}
     */
    const meta_list = [];

    for await (const meta of this) {
      if (meta_list.length >= size) break;

      meta_list.push(meta);
    }

    return meta_list;
  }

  /**
   * @param {string} dest
   * @param {boolean} [clean]
   */
  static start(dest, clean) {
    return new this().setup(dest, clean);
  }
}

module.exports.Store = Store;
