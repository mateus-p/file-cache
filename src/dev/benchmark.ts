// @ts-ignore
import { type Options, type Fn, Bench } from "tinybench";

export interface RunBenchmarkSuiteArgs {
  tasks: {
    name: string;
    args: any;
    fn: Fn;
    opts?: Parameters<Bench["add"]>[2];
  }[];
  runOptions?: Options;
}

type NonNullableArray<Array extends any[]> = Array extends (infer T)[]
  ? NonNullable<T>[]
  : never;

export async function runBenchmarkSuite(args: RunBenchmarkSuiteArgs) {
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

  return (
    bench.table().filter((t) => !!t) as NonNullableArray<
      ReturnType<Bench["table"]>
    >
  ).map((task) => ({
    ...task,
    Args: args.tasks.find((test) => test.name === task["Task Name"])?.args,
  }));
}
