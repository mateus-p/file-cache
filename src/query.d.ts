import { Dot } from "./dot";

export declare type QueryIterable<Input> =
  | IterableIterator<Input>
  | Promise<IterableIterator<Input>>
  | AsyncIterableIterator<Input>
  | Promise<AsyncIterableIterator<Input>>;

/**
 * Helper functions to query through iterators
 */
export declare interface Query {
  findFirst<Input>(
    query: (input: Input) => boolean,
    input: QueryIterable<Input>
  ): Promise<Input | undefined>;

  findMany<Input>(
    query: (input: Input) => boolean,
    input: QueryIterable<Input>
  ): Promise<Input[]>;

  findFirstBy<
    Input extends Record<string, any>,
    Key extends Dot.ToNotation<Input>
  >(
    query: (input: Dot.Use<Input, Key>) => boolean,
    input: QueryIterable<Input>,
    key: Key
  ): Promise<Input | undefined>;

  findManyBy<
    Input extends Record<string, any>,
    Key extends Dot.ToNotation<Input>
  >(
    query: (input: Dot.Use<Input, Key>) => boolean,
    input: QueryIterable<Input>,
    key: Key
  ): Promise<Input[]>;
}

export declare const Query: Query;

export declare type QueryBind<
  Input extends Record<string, any>,
  Output = void
> = {
  findFirst(
    query: (input: Input) => boolean
  ): Promise<(Output extends void ? Input : Output) | undefined>;

  findMany(
    query: (input: Input) => boolean
  ): Promise<Output extends void ? Input[] : Output[]>;

  findFirstBy<Key extends Dot.ToNotation<Input>>(
    query: (input: Dot.Use<Input, Key>) => boolean,
    key: Key
  ): Promise<(Output extends void ? Input : Output) | undefined>;

  findManyBy<Key extends Dot.ToNotation<Input>>(
    query: (input: Dot.Use<Input, Key>) => boolean,
    key: Key
  ): Promise<Output extends void ? Input[] : Output[]>;
};

export declare interface BindQueryTransformer<Input, Output = void> {
  transformer?: (input: Input) => Output;
}

export declare interface BindQueryHandler<Input, Output = void>
  extends BindQueryTransformer<Input, Output> {
  iterator: () => IterableIterator<Input> | Promise<IterableIterator<Input>>;
}

export declare interface BindQueryAsyncHandler<Input, Output = void>
  extends BindQueryTransformer<Input, Output> {
  asyncIterator: () =>
    | AsyncIterableIterator<Input>
    | Promise<AsyncIterableIterator<Input>>;
}

export declare function bindQuery<
  Input extends Record<string, any>,
  Output = void
>(
  handler:
    | BindQueryHandler<Input, Output>
    | BindQueryAsyncHandler<Input, Output>
): QueryBind<Input, Output>;
