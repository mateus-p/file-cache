/**
 * Helper functions to query through iterators
 */
export declare const Query: {
  findFirst<Input>(
    query: (input: Input) => boolean,
    input: IterableIterator<Input> | Promise<IterableIterator<Input>>
  ): Promise<Input | undefined>;

  findMany<Input>(
    query: (input: Input) => boolean,
    input: IterableIterator<Input> | Promise<IterableIterator<Input>>
  ): Promise<Input[]>;
};

export declare type QueryBind<Input, Output = void> = {
  findFirst(
    query: (input: Input) => boolean
  ): Promise<(Output extends void ? Input : Output) | undefined>;

  findMany(
    query: (input: Input) => boolean
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

export declare function bindQuery<Input, Output = void>(
  handler:
    | BindQueryHandler<Input, Output>
    | BindQueryAsyncHandler<Input, Output>
): QueryBind<Input, Output>;
