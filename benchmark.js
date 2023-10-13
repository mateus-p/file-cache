const { runBenchmarkSuite } = require("./dist/dev/benchmark");
const { Cache, CacheManagers } = require("./dist");
const { writeFileSync } = require("fs");
const camelcase = require("lodash.camelcase");
const upperfirst = require("lodash.upperfirst");
const {
  name,
  version,
  devDependencies: { tinybench },
} = require("./package.json");
const { execSync } = require("child_process");

function beautyText(text) {
  return upperfirst(camelcase(text))
    .replaceAll(/([A-Z])/g, " $1")
    .trim();
}

function list(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `- **${beautyText(key)}**: \`${value}\``)
    .join("\n")
    .trim();
}

function simpleList(arr) {
  return arr
    .map((item) => `- \`${item}\``)
    .join("\n")
    .trim();
}

const package_name = beautyText(/\/(.*)/.exec(name)[1]);

const benchmark_metadata = {
  source: `${name}@${version}`,
  benchmark_engine: `tinybench@${tinybench}`,
  os: process.env.OS,
  processor_identifier: process.env.PROCESSOR_IDENTIFIER,
  processor_architecture: process.env.PROCESSOR_ARCHITECTURE,
  number_of_processors: process.env.NUMBER_OF_PROCESSORS,
  used_drive: 'SanDisk SDSSDA 2.5" 240gb',
  node_version: execSync("node -v").toString(),
};

const toCellText = (v) => {
  if (typeof v == "object") return `\`${JSON.stringify(v)}\``;
  else return String(v);
};

// Cache
const main = async () => {
  const { default: tablemark } = await import("tablemark");

  /**
   * @type {Parameters<typeof runBenchmarkSuite>[0]['tasks']}
   */
  const tasks = [];

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

  const result = await runBenchmarkSuite({
    tasks,
    runOptions: {},
  });

  const benchmark_md_lines = [
    `# ${package_name} Benchmark`,

    "## Metadata",

    list(benchmark_metadata),

    "## Benchmark Results",

    tablemark(result, {
      caseHeaders: false,
      toCellText,
    }),

    "## Todo",

    simpleList([
      "Cache#delete (+ variants)",
      "Cache#getMeta",
      "Cache#loadFromStore",
      "Cache#flushToStore",
      "Cache#save (+ variants)",
      "Cache#has (+ variants)",
      "Cache#query#(methods) (+ variants)",
    ]),

    "## Future Benchmarks",

    simpleList(["Store"]),
  ];

  writeFileSync("./BENCHMARK.md", benchmark_md_lines.join("\n\n").trim());
};

main();
