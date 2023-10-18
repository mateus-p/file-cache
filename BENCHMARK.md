# File Cache Benchmark

## Metadata

- **Source**: `@mateus-pires/file-cache@1.1.1`
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
| Cache#set (no overflow) | 20.943    | 47748.50088777901  | ±2.90% | 10474   | `{"max_size":500000,"value_manager":"[[BuiltInManagers#String]]"}` |
| Cache#set (overflow)    | 371       | 2693993.0477563073 | ±2.77% | 187     | `{"max_size":1,"value_manager":"[[BuiltInManagers#String]]"}`      |
| Cache#get (from map)    | 3.470.763 | 288.1210074912593  | ±2.56% | 1735382 | `{"max_size":2,"value_manager":"[[BuiltInManagers#String]]"}`      |
| Cache#get (from store)  | 1.310     | 762950.4578142632  | ±1.96% | 656     | `{"max_size":1,"value_manager":"[[BuiltInManagers#String]]"}`      |


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