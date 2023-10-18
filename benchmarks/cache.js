const { CacheManagers, Cache } = require("../src");

/**
 * @type {(tasks: import('../src/dev/benchmark').Task[], todos: string[]) => Promise<void>}
 */
module.exports = async (tasks, todos) => {
  todos.push(
    "Cache#delete (+ variants)",
    "Cache#getMeta",
    "Cache#loadFromStore",
    "Cache#flushToStore",
    "Cache#save (+ variants)",
    "Cache#has (+ variants)",
    "Cache#query#(methods) (+ variants)"
  );

  // Cache#set (no overflow)
  {
    const cacheArgs = {
      max_size: 500_000,
      value_manager: CacheManagers.String,
      store: { dest: "cache-benchmark", clean: true },
    };

    const cache = await Cache.start(cacheArgs);

    tasks.push({
      name: `Cache#set (no overflow)`,
      fn: () => cache.set("test", "test"),
      args: {
        max_size: cacheArgs.max_size,
        value_manager: cacheArgs.value_manager,
      },
    });
  }

  // Cache#set (overflow)
  {
    const cacheArgs = {
      max_size: 1,
      value_manager: CacheManagers.String,
      store: { dest: "cache-benchmark", clean: true },
    };

    const cache = await Cache.start(cacheArgs);

    tasks.push({
      name: `Cache#set (overflow)`,
      fn: () => cache.set("test", "test"),
      args: {
        max_size: cacheArgs.max_size,
        value_manager: cacheArgs.value_manager,
      },
    });
  }

  // Cache#get (from map)
  {
    const cacheArgs = {
      max_size: 2,
      value_manager: CacheManagers.String,
      store: { dest: "cache-benchmark", clean: true },
    };

    const cache = await Cache.start(cacheArgs);

    const key = await cache.set("test", "test");

    tasks.push({
      name: `Cache#get (from map)`,
      fn: () => cache.get(key),
      args: {
        max_size: cacheArgs.max_size,
        value_manager: cacheArgs.value_manager,
      },
    });
  }

  // Cache#get (from store)
  {
    const cacheArgs = {
      max_size: 1,
      value_manager: CacheManagers.String,
      store: { dest: "cache-benchmark", clean: true },
    };

    const cache = await Cache.start(cacheArgs);

    const key = await cache.set("test", "test");

    await cache.flushToStore();

    tasks.push({
      name: `Cache#get (from store)`,
      fn: () => cache.get(key, true),
      opts: {
        afterEach: () => cache.flushToStore(),
      },
      args: {
        max_size: cacheArgs.max_size,
        value_manager: cacheArgs.value_manager,
      },
    });
  }
};
