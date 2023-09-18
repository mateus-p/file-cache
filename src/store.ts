import type { NullableCacheValue, RawCacheEntry, RawCachePair } from "./cache";
import { existsSync } from "fs";
import { writeFile, readFile, readdir, mkdir, rm, stat } from "fs/promises";
import path from "path";

export interface IStore {
  dest: string;
  insert(pairs: RawCachePair[]): Promise<void>;
  /**
   * @param _skipCheck **INTERNAL USAGE ONLY**
   */
  retrieve(key: string, _skipCheck?: boolean): Promise<NullableCacheValue>;
  check(key: string): string | false;
  setup(dest: string, clean?: boolean): Promise<void>;
  delete(key: string): Promise<void>;
  load(size: number): Promise<RawCacheEntry[]>;
}

class Store implements IStore {
  private __unfinished_write_calls = 0;
  dest = "";

  async delete(key: string) {
    const file = path.resolve(this.dest, key);

    if (!existsSync(file)) return;

    await rm(file);
  }

  check(key: string) {
    const file = path.resolve(this.dest, key);

    return existsSync(file) ? file : false;
  }

  async setup(dest: string, clean?: boolean) {
    this.dest = path.resolve(dest);

    if (!existsSync(this.dest)) await mkdir(this.dest, { recursive: true });
    else if (clean) {
      await rm(this.dest, { force: true, recursive: true });
      await mkdir(this.dest, { recursive: true });
    }
  }

  async retrieve(key: string, _skipCheck?: boolean) {
    const file = _skipCheck ? path.resolve(this.dest, key) : this.check(key);

    if (!file) return undefined;

    const content = (await readFile(file)).toString();

    if (!content) return undefined;

    return content;
  }

  async insert(pairs: RawCachePair[]) {
    if (!this.dest) throw new Error("Cannot insert before setup");

    for (const pair of pairs) {
      this.__unfinished_write_calls += 1;

      await writeFile(path.resolve(this.dest, pair.key), pair.value || "");

      this.__unfinished_write_calls -= 1;
    }
  }

  async load(size: number) {
    if (!this.dest) throw new Error("Cannot load before setup");

    const files = await readdir(this.dest);

    const file_stats = await Promise.all(
      files.map(async (file) => ({
        name: file,
        time: (await stat(path.resolve(this.dest, file))).mtime.getTime(),
      }))
    );

    const keys = file_stats
      .sort(function (a, b) {
        return a.time - b.time;
      })
      .slice(size * -1)
      .map(function (file) {
        return file.name;
      });

    return (await Promise.all(
      keys.map(async (key) => [key, (await this.retrieve(key, true))!])
    )) as RawCacheEntry[];
  }
}

export default Store;
