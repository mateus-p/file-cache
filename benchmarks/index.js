const submitCacheBenchmarks = require("./cache");
const { runBenchmarkSuite, Util } = require("./dev/benchmark");
const {
  name,
  version,
  devDependencies: { tinybench },
} = require("../package.json");
const { execSync } = require("child_process");
const { writeFileSync } = require("fs");

const package_name = Util.beautyText(/\/(.*)/.exec(name)[1]);

const benchmark_metadata = {
  source: `${name}@${version}`,
  benchmark_engine: `tinybench@${tinybench}`,
  os: process.env.OS,
  processor_identifier: process.env.PROCESSOR_IDENTIFIER,
  processor_architecture: process.env.PROCESSOR_ARCHITECTURE,
  number_of_processors: process.env.NUMBER_OF_PROCESSORS,
  used_drive: execSync("wmic diskdrive get model")
    .toString()
    .split("\n")[1]
    .trim(),
  node_version: execSync("node -v").toString().trim(),
};

const toCellText = (v) => {
  if (typeof v == "object") return `\`${JSON.stringify(v)}\``;
  else return String(v);
};

/**
 * @type {Promise<void>[]}
 */
const submits = [];

/**
 * @type {import('../dist/dev/benchmark').Task[]}
 */
const tasks = [];

/**
 * @type {string[]}
 */
const todos = [];

submits.push(submitCacheBenchmarks(tasks, todos));

const main = async () => {
  await Promise.all(submits);

  const { default: tablemark } = await import("tablemark");

  const result = await runBenchmarkSuite({
    tasks,
    runOptions: {},
  });

  const benchmark_md_lines = [
    `# ${package_name} Benchmark`,

    "## Metadata",

    Util.list(benchmark_metadata),

    "## Benchmark Results",

    tablemark(result, {
      caseHeaders: false,
      toCellText,
    }),

    "## Todo",

    Util.simpleList(todos),

    "## Future Benchmarks",

    Util.simpleList([
      "Store",
      "CacheManagers#String",
      "CacheManagers#JSON",
      "CacheManagers#Zod",
    ]),
  ];

  const bench_marked = benchmark_md_lines.join("\n\n").trim();

  writeFileSync("./BENCHMARK.md", bench_marked);
};

main();
