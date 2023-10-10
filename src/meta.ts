import { Key, KeySouce } from "./key";

export interface MetadataSource {
  key: KeySouce;
  created_at_ts: number;
  modified_at_ts: number;
}

/**
 * This class represents the metadata of files managed by `Store`,
 * that is, it is implemented and controlled by `Store`.
 */
export class Metadata implements MetadataSource {
  #created_at_ts = Date.now();
  #modified_at_ts = this.#created_at_ts;

  get created_at_ts() {
    return this.#created_at_ts;
  }

  get modified_at_ts() {
    return this.#modified_at_ts;
  }

  touch() {
    this.#modified_at_ts = Date.now();
  }

  toSource(): MetadataSource {
    return {
      key: this.key.toSource(),
      created_at_ts: this.#created_at_ts,
      modified_at_ts: this.#modified_at_ts,
    };
  }

  static fromSource(source: MetadataSource) {
    const meta = new this(Key.fromSource(source.key));

    meta.#created_at_ts = source.created_at_ts;
    meta.#modified_at_ts = source.modified_at_ts;

    return meta;
  }

  constructor(public key: Key) {}
}
