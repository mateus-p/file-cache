const { dot } = require("./utils/dot");

/**
 * @type {import('./query.d.ts').Query}
 */
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

  async findFirstBy(query, input, key) {
    for await (const item of await input) {
      if (query(dot(item, key))) return item;
    }
  },

  async findManyBy(query, input, key) {
    const result = [];

    for await (const item of await input) {
      if (query(dot(item, key))) result.push(item);
    }

    return result;
  },
};

/**
 * @type {import('./query').BindQueryFn}
 */
const bindQuery = (handler) => {
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

    async findFirstBy(query, key) {
      const result = await Query.findFirstBy(
        query,
        (handler.iterator || handler.asyncIterator)(),
        key
      );

      if (!result) return;

      return handler.transformer?.(result) || result;
    },

    async findManyBy(query, key) {
      const result = await Query.findManyBy(
        query,
        (handler.iterator || handler.asyncIterator)(),
        key
      );

      return (handler.transformer && result.map(handler.transformer)) || result;
    },
  };
};

module.exports.bindQuery = bindQuery;
module.exports.Query = Query;
