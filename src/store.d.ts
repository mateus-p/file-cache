import type { RawCacheEntry, RawCachePair } from "./cache";
import { Key } from "./key";
import { Metadata, MetadataSource } from "./meta";
import { QueryBind } from "./query";

// @ts-ignore
const skip_check_symbol: unique symbol;
// @ts-ignore
const meta_symbol: unique symbol;

export declare class Store<Ready extends boolean>
  implements AsyncIterable<Metadata>
{
  /**
   * Iterate over meta files stored on disk.
   *
   * @example
   * const store = new Store();
   * for await (meta of store) {}
   */
  [Symbol.asyncIterator](): AsyncIterableIterator<Metadata>;

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
  query: QueryBind<Metadata>;

  /**
   * Create new, ready to use, Store instance
   */
  static start(dest: string, clean?: boolean): Promise<Store<true>>;
}
