# File Cache Benchmark

## Metadata

- **Source**: `@mateus-pires/file-cache@1.0.1`
- **Benchmark Engine**: `tinybench@^2.5.1`
- **Os**: `Windows_NT`
- **Processor Identifier**: `Intel64 Family 6 Model 126 Stepping 5, GenuineIntel`
- **Processor Architecture**: `AMD64`
- **Number Of Processors**: `8`
- **Used Drive**: `SanDisk SDSSDA 2.5" 240gb`
- **Node Version**: `v18.18.1
`

## Benchmark Results

| Task Name               | ops/sec   | Average Time (ns)  | Margin  | Samples | Args                                                               |
| :---------------------- | :-------- | :----------------- | :------ | :------ | :----------------------------------------------------------------- |
| Cache#set (no overflow) | 18.295    | 54656.799411898784 | ±4.35%  | 9148    | `{"max_size":500000,"value_manager":"[[BuiltInManagers#String]]"}` |
| Cache#set (overflow)    | 111       | 8963616.073131561  | ±34.57% | 56      | `{"max_size":1,"value_manager":"[[BuiltInManagers#String]]"}`      |
| Cache#get (from map)    | 3.908.638 | 255.8435823182757  | ±10.87% | 1954405 | `{"max_size":2,"value_manager":"[[BuiltInManagers#String]]"}`      |
| Cache#get (from store)  | 642       | 1556562.7326506267 | ±1.99%  | 322     | `{"max_size":1,"value_manager":"[[BuiltInManagers#String]]"}`      |


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