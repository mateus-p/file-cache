import type { RawCacheEntry, RawCachePair } from "./cache";
import { existsSync } from "fs";
import { writeFile, readFile, mkdir, rm } from "fs/promises";
import path from "path";
import { Key } from "./key";
import { glob } from "glob";
import { Metadata, MetadataSource } from "./meta";
import v8 from "v8";
import { QueryBind, bindQuery } from "./query";

export interface IStore<Ready extends boolean> {
  /**
   * Where all items will be placed
   */
  dest: Ready extends true ? string : undefined;

  /**
   * Ready to use
   */
  readonly ready: Ready;

  /**
   * Insert items into the store.
   */
  insert(pairs: RawCachePair<Buffer>[]): Promise<void>;

  /**
   * @param _skip_check **INTERNAL USAGE ONLY**
   */
  retrieve(
    key: Key,
    _skip_check?: typeof skip_check_symbol
  ): Promise<Buffer | undefined>;

  /**
   * @param _skip_check **INTERNAL USAGE ONLY**
   */
  retrieveMeta(
    key: Key,
    _skip_check?: typeof skip_check_symbol
  ): Promise<Metadata | undefined>;

  /**
   * @param __meta **INTERNAL USAGE ONLY**
   * @returns If `key` exists, return full path to the file, and `false` otherwise.
   */
  check(key: Key, __meta?: typeof meta_symbol): string | false;

  /**
   * @param clean Clean up target folder
   */
  setup(dest: string, clean?: boolean): Promise<Store<true>>;

  /**
   * @returns true if an element in the Store existed and has been removed, or false if the element does not exist.
   */
  delete(key: Key): Promise<boolean>;

  /**
   * Loaded elements are reverse chronologically sorted
   *
   * @param size limits array size
   */
  load(size: number): Promise<RawCacheEntry<Buffer>[]>;

  /**
   * Loaded elements are reverse chronologically sorted
   *
   * @param size limits array size
   */
  loadMeta(size?: number): Promise<MetadataSource[]>;

  // /**
  //  * Wait until there is no ongoing write/read/delete calls.
  //  */
  // waitIdle(): Promise<void>;

  reset(): Promise<void>;

  /**
   * Utility to query through stored metadata
   */
  query: QueryBind<MetadataSource, Metadata>;
}

const skip_check_symbol = Symbol("store.skip_check");
const meta_symbol = Symbol("store.meta");
const meta_key = ".meta";

export class Store<Ready extends boolean = false> implements IStore<Ready> {
  #ready = false as Ready;

  dest = undefined as Ready extends true ? string : undefined;

  query = bindQuery({
    iterator: async () => {
      return (await this.loadMeta()).values();
    },
    transformer: (input) => Metadata.fromSource(input),
  });

  get ready() {
    return this.#ready;
  }

  async reset() {
    if (!this.dest) {
      throw new Error("Cannot reset before setup");
    }

    await rm(this.dest, { recursive: true, force: true });

    await mkdir(this.dest);
  }

  async delete(key: Key) {
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

  check(key: Key, __meta?: typeof meta_symbol) {
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

  async setup(dest: string, clean?: boolean) {
    // @ts-ignore
    this.dest = path.resolve(dest);

    if (clean) await rm(this.dest, { force: true, recursive: true });

    if (!existsSync(this.dest)) await mkdir(this.dest, { recursive: true });

    // @ts-ignore
    this.#ready = true;

    return this as Store<true>;
  }

  async retrieve(key: Key, __skip_check?: typeof skip_check_symbol) {
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

  async retrieveMeta(key: Key, _skip_check?: typeof skip_check_symbol) {
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

    return Metadata.fromSource(v8.deserialize(buf));
  }

  async insert(pairs: RawCachePair<Buffer>[]) {
    if (!this.dest) {
      throw new Error("Cannot insert before setup");
    }

    for (const pair of pairs) {
      const meta =
        (await this.retrieveMeta(pair.key)) || new Metadata(pair.key);

      meta.touch();

      await writeFile(path.resolve(this.dest, pair.key.id), pair.value);

      await writeFile(
        path.resolve(this.dest, pair.key.id + meta_key),
        v8.serialize(meta.toSource())
      );
    }
  }

  async load(size: number) {
    const meta = await this.loadMeta(size);

    return Promise.all(
      meta.map(async (m) => {
        const key = Key.fromSource(m.key);
        return [key, (await this.retrieve(key, skip_check_symbol))!];
      })
    ) as Promise<RawCacheEntry<Buffer>[]>;
  }

  async loadMeta(size: number = 0) {
    if (!this.dest) {
      throw new Error("Cannot load before setup");
    }

    const files = await glob(`*${meta_key}`, { cwd: this.dest });

    return Promise.all(
      files
        .slice(size * -1)
        .map(
          async (file) =>
            v8.deserialize(
              await readFile(path.resolve(this.dest!, file))
            ) as MetadataSource
        )
    );
  }

  /**
   * Create new, ready to use, Store instance
   */
  static start(dest: string, clean?: boolean) {
    return new this().setup(dest, clean);
  }
}
