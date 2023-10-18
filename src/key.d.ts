export declare interface KeySouce {
  readonly id: string;
  name: string;
  readonly created_at_ts: number;
  readonly updated_at_ts: number;
}

export declare class Key implements KeySouce {
  constructor(name: string);

  readonly id: string;
  name: string;
  readonly created_at_ts: number;
  readonly updated_at_ts: number;

  toSource(): KeySouce;

  static fromSource(source: KeySouce): Key;
}
