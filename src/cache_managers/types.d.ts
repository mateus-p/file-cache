export declare interface CacheValueManager<Type> {
  /**
   * @deprecated since v1.2. Use {@link fromBuffer}
   */
  revive?(args: {
    fileCachePath?: string;
    buffer: () => Promise<Buffer> | Buffer;
  }): Promise<Type> | Type;

  test(value: any): { pass: boolean; failReason?: string };

  toBuffer(value: Type): Buffer;

  /**
   * @deprecated since v1.2. Use {@link toBuffer}
   */
  bake?(value: Type): Buffer;

  fromBuffer(buf: Buffer): Type;
  fromBuffer(buf: Promise<Buffer>): Promise<Type>;

  /**
   * For benchmark readability.
   */
  toJSON?(): string;
}
