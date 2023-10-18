/// <reference types="./query.d.ts" />

const Query = {
  async findFirst(query, input) {
    for await (const item of await input) {
      if (query(item)) return item;
    }
  },

  async findMany(query, input) {
    const result = [];

    for await (const item of await input) {
      if (query(item)) result.push(item);
    }

    return result;
  },
};

/**
 * @param {import(".").BindQueryHandler | import(".").BindQueryAsyncHandler} handler
 */
function bindQuery(handler) {
  return {
    async findFirst(query) {
      const result = await Query.findFirst(
        query,
        (handler.iterator || handler.asyncIterator)()
      );

      if (!result) return;

      return handler.transformer?.(result) || result;
    },

    async findMany(query) {
      const result = await Query.findMany(
        query,
        (handler.iterator || handler.asyncIterator)()
      );

      return (handler.transformer && result.map(handler.transformer)) || result;
    },
  };
}

module.exports.bindQuery = bindQuery;
module.exports.Query = Query;
