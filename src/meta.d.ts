import { Key, KeySouce } from "./key";

export declare interface MetadataSource {
  key: KeySouce;
  created_at_ts: number;
  modified_at_ts: number;
}

/**
 * This class represents the metadata of files managed by `Store`,
 * that is, it is implemented and controlled by `Store`.
 */
export declare class Metadata implements MetadataSource {
  key: Key;
  readonly created_at_ts: number;
  readonly modified_at_ts: number;

  touch(): void;
  toSource(): MetadataSource;

  static fromSource(source: MetadataSource): Metadata;

  static fromBuffer(buffer: Buffer): Metadata;

  constructor(key: Key);
}
