export namespace Dot {
  export type BreakDown<Object, Result = void> = {
    [K in keyof Object as string]: K extends string
      ? Result extends string
        ? ToString<Object[K], `${Result}.${K}` | Result>
        : ToString<Object[K], K>
      : never;
  };

  export type ToString<Object, Result = void> = Object extends string
    ? Result extends string
      ? Result
      : never
    : BreakDown<Object, Result>[keyof BreakDown<Object, Result>];

  export type Prepare<Object extends Record<string, any>> = {
    [K in keyof Object]: Object[K] extends object ? Prepare<Object[K]> : string;
  };

  /**
   * @example
   * const x: Dot.ToNotation<{ a: number; b: { c: string } }>[] = [
   *  "a",
   *  "b",
   *  "b.c"
   * ]
   */
  export type ToNotation<Object extends Record<string, any>> = ToString<
    Prepare<Object>
  >;

  export type Split<
    String extends string,
    Array extends string[] = []
  > = String extends `${infer R}.${infer T}`
    ? Split<T, [...Array, R]>
    : [...Array, String];

  export type Access<
    Object extends Record<string, any>,
    Array extends string[]
  > = Array extends [infer K extends string, ...infer R extends string[]]
    ? Access<Object[K], R>
    : Object;

  /**
   * @example
   * const x: Dot.Use<{ a: string; b: { c: number } }, "b.c"> = 101
   */
  export type Use<
    Object extends Record<string, any>,
    Key extends string
  > = Access<Object, Split<Key>>;
}

export declare type DotFn = <
  Target extends Record<string, any>,
  Key extends string
>(
  target: Target,
  key: Key
) => Dot.Use<Target, Key>;

export declare const dot: DotFn;
