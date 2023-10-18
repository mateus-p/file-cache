# File Cache Benchmark

## Metadata

- **Source**: `@mateus-pires/file-cache@1.1.0`
- **Benchmark Engine**: `tinybench@^2.5.1`
- **Os**: `Windows_NT`
- **Processor Identifier**: `Intel64 Family 6 Model 126 Stepping 5, GenuineIntel`
- **Processor Architecture**: `AMD64`
- **Number Of Processors**: `8`
- **Used Drive**: `NVMe KINGSTON SNVS500`
- **Node Version**: `v18.18.1`

## Benchmark Results

| Task Name               | ops/sec   | Average Time (ns)  | Margin | Samples | Args                                                               |
| :---------------------- | :-------- | :----------------- | :----- | :------ | :----------------------------------------------------------------- |
| Cache#set (no overflow) | 21.981    | 45492.8716419393   | ±3.05% | 10998   | `{"max_size":500000,"value_manager":"[[BuiltInManagers#String]]"}` |
| Cache#set (overflow)    | 224       | 4463930.087015692  | ±8.06% | 113     | `{"max_size":1,"value_manager":"[[BuiltInManagers#String]]"}`      |
| Cache#get (from map)    | 4.329.049 | 230.99760742051797 | ±2.15% | 2164525 | `{"max_size":2,"value_manager":"[[BuiltInManagers#String]]"}`      |
| Cache#get (from store)  | 1.349     | 741148.8891089404  | ±1.95% | 675     | `{"max_size":1,"value_manager":"[[BuiltInManagers#String]]"}`      |


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
- `CacheManagers#String`
- `CacheManagers#JSON`
- `CacheManagers#Zod`