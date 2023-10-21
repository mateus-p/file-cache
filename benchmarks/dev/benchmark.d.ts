// @ts-ignore
import { Options, Fn, Bench } from "tinybench";

export declare interface Task {
  name: string;
  args: any;
  fn: Fn;
  opts?: Parameters<Bench["add"]>[2];
}

export declare interface RunBenchmarkSuiteArgs {
  tasks: Task[];
  runOptions?: Options;
}

export declare type NonNullableArray<Array extends any[]> =
  Array extends (infer T)[] ? NonNullable<T>[] : never;

export declare function runBenchmarkSuite(args: RunBenchmarkSuiteArgs): Promise<
  {
    Args: any;
    "Task Name": string;
    "ops/sec": string;
    "Average Time (ns)": number;
    Margin: string;
    Samples: number;
  }[]
>;

export declare const Util: {
  beautyText(text: string): string;

  list(obj: Record<string, string>): string;

  simpleList(arr: string[]): string;
};
