# File Cache

> This README is a work in progress

File Cache uses `Map`, `fs/promises` and some "clever" tricks to handle `fs <=> memory` data sharing.

It is being designed to be a very useful/convenient caching tool.

I will focus on performance later (maybe on v2), but remember: since it makes heavy use of the file system, a SSD is higly recommended at enterprise scale.

## How to use

### Cache

| Properties                                                    | Methods                                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `max_size: number`                                            | `delete(key: string, include_store?: boolean): Promise<boolean>`                                 |
| `readonly ready: boolean`                                     | `set(key: string, value: Type): Promise<CacheSetResult>`                                         |
| `store: Store`                                                | `get(key: string): Promise<NullableCacheValue<Type>>`                                            |
| `value_manager: CacheValueManager`                            | `has(key: string, include_store?: boolean): boolean;`                                            |
| + binds all other properties from inner `map`, such as `size` | `loadFromStore(): Promise<void>`                                                                 |
|                                                               | `flushToStore(): Promise<void>`                                                                  |
|                                                               | `update(key: string, new_value: NonNullable<Type>, sync_with_store?: boolean): Promise<boolean>` |
|                                                               | `save(keys: string[] \| "all"): Promise<void>`                                                   |
|                                                               | + binds all other methods from inner `map`, such as `entries`                                    |

```ts
import { Cache, Store } from "@mateus-pires/file-cache";

const store = new Store

await store.setup('./cache-dir')

const cache = new Cache({
  max_size: 500,
  store,
  value_manager: { ... } as CacheValueManager,
});
```

In the example above, we are creating a new `Store` instance, configuring it to place the cache files in `./cache-dir` and then creating a `Cache` instance, with a maximum size of 500 items.

The type of `value_manager` is intrinsically linked to the type of this Cache instance, since it is responsible for validating the insertion of new values, as well as the transformation to/from the file system.

```ts
// cache: Cache<string>
const cache = new Cache({ value_manager: { ... } as CacheValueManager<string> })
```

Cache only supports string keys, but the value can be virtually anything, as long as it is possible to save it in a file.

File Cache ships with two built-in value managers:

- String: As the name suggests, this value manager handles string values, saving them to the file system in UTF-8 format. `import StringManager from "@mateus-pires/file-cache/cache_managers/string"`
- Zod: Powered by `node:v8` and `zod` (as a peer dependency, please install it if you use it), with this value manager it is possible to save any serializable object, as well as perform type checking at runtime. `import createZodManager from "@mateus-pires/file-cache/cache_managers/zod"`

_Note_: you can create your own value manager, like so:

```ts
import { type CacheValueManager } from "@mateus-pires/file-cache";

const manager: CacheValueManager<AnythingYouWant> = { ... }
```

### BidirectionalCache

> _TODO_: doc

```ts
import { BidirectionalCache } from "@mateus-pires/file-cache";

const bcache = new BidirectionalCache({
  max_size: 500;
  root_store_path: "./bcache-dir";
});

await bcache.setup()
```

### Store

> _TODO_: doc

```ts
import { Store } from "@mateus-pires/file-cache";

const store = new Store();

await store.setup("./dir");
```

### Util

> _TODO_: doc

```ts
import { Util } from "@mateus-pires/file-cache";

await Util.awaitEOS();

await Util.waitUntil(() => x == 2);
```

## Roadmap

- [] Complete README.md

- [] Add tests

- [] Make sure it is a stable v1

- [] Add CONTRIBUTING.md

- [] Add CODE_OF_CONDUCT.md
