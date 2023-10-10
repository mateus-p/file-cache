/**
 * Helper functions to query through iterators
 */
export const Query = {
  async findFirst<Input>(
    query: (input: Input) => boolean,
    input: IterableIterator<Input> | Promise<IterableIterator<Input>>
  ) {
    for (const item of await input) {
      if (query(item)) return item;
    }
  },

  async findMany<Input>(
    query: (input: Input) => boolean,
    input: IterableIterator<Input> | Promise<IterableIterator<Input>>
  ) {
    const result: Input[] = [];

    for (const item of await input) {
      if (query(item)) result.push(item);
    }

    return result;
  },
};

export type QueryBind<Input, Output = void> = {
  findFirst(
    query: (input: Input) => boolean
  ): Promise<(Output extends void ? Input : Output) | undefined>;

  findMany(
    query: (input: Input) => boolean
  ): Promise<Output extends void ? Input[] : Output[]>;
};

export function bindQuery<Input, Output = void>(handler: {
  iterator: () => IterableIterator<Input> | Promise<IterableIterator<Input>>;
  transformer?: (input: Input) => Output;
}): QueryBind<Input, Output> {
  return {
    async findFirst(query: (input: Input) => boolean) {
      const result = await Query.findFirst(query, handler.iterator());

      if (!result) return;

      return (handler.transformer?.(result) || result) as Output extends void
        ? Input
        : Output;
    },

    async findMany(query: (input: Input) => boolean) {
      const result = await Query.findMany(query, handler.iterator());

      return ((handler.transformer && result.map(handler.transformer)) ||
        result) as Output extends void ? Input[] : Output[];
    },
  };
}
