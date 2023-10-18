export declare interface CacheValueManager<Type> {
  revive(args: {
    fileCachePath?: string;
    buffer: () => Promise<Buffer> | Buffer;
  }): Promise<Type> | Type;

  test(value: any): { pass: boolean; failReason?: string };

  bake(value: Type): Buffer;

  /**
   * For benchmark readability.
   */
  toJSON?(): string;
}
