# File Cache Benchmark

## Metadata

- **Source**: `@mateus-pires/file-cache@1.0.0`
- **Benchmark Engine**: `tinybench@^2.5.1`
- **Os**: `Windows_NT`
- **Processor Identifier**: `Intel64 Family 6 Model 126 Stepping 5, GenuineIntel`
- **Processor Architecture**: `AMD64`
- **Number Of Processors**: `8`
- **Used Drive**: `SanDisk SDSSDA 2.5" 240gb`
- **Node Version**: `v18.18.1
`

## Benchmark Results

| Task Name               | ops/sec   | Average Time (ns)  | Margin | Samples | Args                                                               |
| :---------------------- | :-------- | :----------------- | :----- | :------ | :----------------------------------------------------------------- |
| Cache#set (no overflow) | 19.457    | 51393.20648035067  | ±4.10% | 9730    | `{"max_size":500000,"value_manager":"[[BuiltInManagers#String]]"}` |
| Cache#set (overflow)    | 170       | 5857288.372031478  | ±3.36% | 86      | `{"max_size":1,"value_manager":"[[BuiltInManagers#String]]"}`      |
| Cache#get (from map)    | 4.066.623 | 245.9042222250495  | ±2.17% | 2033312 | `{"max_size":2,"value_manager":"[[BuiltInManagers#String]]"}`      |
| Cache#get (from store)  | 663       | 1506156.3248914408 | ±1.79% | 332     | `{"max_size":1,"value_manager":"[[BuiltInManagers#String]]"}`      |


## Todo

- `Cache#delete (+ variants)`
- `Cache#getMeta`
- `Cache#loadFromStore`
- `Cache#flushToStore`
- `Cache#save (+ variants)`
- `Cache#has (+ variants)`
- `Cache#query#(methods) (+ variants)`

## Future Benchmarks

- `Store`