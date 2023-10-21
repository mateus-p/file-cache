const camelcase = require("lodash.camelcase");
const upperfirst = require("lodash.upperfirst");
const { Bench } = require("tinybench");

async function runBenchmarkSuite(args) {
  const bench = new Bench(args.runOptions);

  for (const task of args.tasks) {
    bench.add(task.name, task.fn, {
      ...task.opts,

      beforeAll: function () {
        const aft = task.opts?.beforeAll?.call(this);

        console.log(`Init "${this.name}" task;`);

        return aft;
      },

      afterAll: function () {
        const aft = task.opts?.afterAll?.call(this);

        console.log(`Task "${this.name}" finished;`);

        return aft;
      },
    });
  }

  console.log("Running warmup...");

  await bench.warmup();

  console.log("Warmup completed...");

  console.log("Running bench...");

  await bench.run();

  console.log("Bench completed...");

  return bench
    .table()
    .filter((t) => !!t)
    .map((task) => ({
      ...task,
      Args: args.tasks.find((test) => test.name === task["Task Name"])?.args,
    }));
}

const Util = {
  beautyText(text) {
    return upperfirst(camelcase(text))
      .replaceAll(/([A-Z])/g, " $1")
      .trim();
  },

  list(obj) {
    return Object.entries(obj)
      .map(([key, value]) => `- **${this.beautyText(key)}**: \`${value}\``)
      .join("\n")
      .trim();
  },

  simpleList(arr) {
    return arr
      .map((item) => `- \`${item}\``)
      .join("\n")
      .trim();
  },
};

module.exports.runBenchmarkSuite = runBenchmarkSuite;
module.exports.Util = Util;
