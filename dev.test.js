const { Cache, CacheManagers } = require("./src");
const zod = require("zod");

const zod_manager = CacheManagers.Zod(
  zod
    .object({
      r: zod.number(),

      j: zod.object({ t: zod.string().nullish() }),
    })
    .strict()
);

(async () => {
  const cache = await Cache.start({
    max_size: 1000,
    store: { dest: "test" },
    value_manager: zod_manager,
  });

  await cache.set("oi", { j: { t: "teste" }, r: 1 });

  console.log(await cache.query.findFirstBy((name) => name == "oi", "name"));

  await cache.flushToStore();

  const result = await cache.storeQuery.findFirstBy(
    (name) => name == "oi",
    "key.name"
  );

  console.log(result);

  console.log(await zod_manager.fromBuffer(result.value));
})();

require("node:test");
