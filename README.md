# File Cache

> This README is a work in progress

[API Reference](https://mateus-p.github.io/file-cache/)

File Cache uses `Map`, `fs/promises` and some "clever" tricks to handle `fs <=> memory` data sharing.

It is being designed to be a very useful/convenient caching tool.

I will focus on performance later (maybe on v2), but remember: since it makes heavy use of the file system, a SSD is higly recommended at enterprise scale.

## How to use

### Cache

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

This can also be achieved using the static `start` function.

```ts
import { Cache } from "@mateus-pires/file-cache";

const cache = await Cache.start({
  max_size: 500,
  store: { dest: "./cache-dir" },
  value_manager: { ... } as CacheValueManager,
});
```

The type of `value_manager` is intrinsically linked to the type of this Cache instance, since it is responsible for validating the insertion of new values, as well as the transformation to/from the file system.

```ts
// cache: Cache<string>
const cache = new Cache({ value_manager: { ... } as CacheValueManager<string> })
```

Cache only supports `Key (check API reference)` keys, but the value can be virtually anything, as long as it is possible to save it in a file.

File Cache ships with three built-in value managers:

#### String

> As the name suggests, this value manager handles string values, saving them to the file system in UTF-8 format.
>
> ```ts
> import { CacheManagers } from "@mateus-pires/file-cache";
>
> // cache: Cache<string>
> const cache = new Cache({ value_manager: CacheManagers.String });
> ```

#### Zod

> Powered by `node:v8` and `zod` (as a peer dependency, please install it if you use it), with this value manager it is possible to save any serializable object, as well as perform type checking at runtime.
>
> **Note**:
>
> - Almost all objects are serializable (string, number, null, bigint, undefined, objects, arrays etc).
> - Functions are NOT serializable, nor anything that depends on or includes them (classes, objects that contain functions, etc.), except built-in classes such as Date.
>
> ```ts
> import { CacheManagers } from "@mateus-pires/file-cache";
> import z from "zod";
>
> const ZodManager = CacheManagers.Zod(
>   z.object({ a: z.string().optional(), b: z.number() })
> );
>
> // cache: Cache<{ a?: string; b: number }>
> const cache = new Cache({ value_manager: ZodManager });
> ```

#### JSON

> JSON is almost the same as String, with the exception that it uses `JSON.parse` and `JSON.stringify`.
>
> ```ts
> import { CacheManagers } from "@mateus-pires/file-cache";
>
> // cache: Cache<Record<string, any>>
> const cache = new Cache({ value_manager: CacheManagers.JSON });
> ```

**Note**: you can create your own value manager, like so:

```ts
import type { CacheValueManager } from "@mateus-pires/file-cache";

const manager: CacheValueManager<AnythingYouWant> = { ... }
```

### BidirectionalCache

**This functionality was removed on `v1.0.0-dev.3`.**

### Store

The Cache was built to handle information I/O, with features to make everything easier. But it is possible to override the Cache and go directly to the "gate" that it uses to manage information stored on disk.

```ts
import { Store, Key } from "@mateus-pires/file-cache";

const store = new Store();

await store.setup("./dir");

// You can also use Store.start()

await store.insert([
  {
    key: new Key("hello"),
    value: Buffer.from("world"),
  },
]);
```

### Util

General utilities.

```ts
import { Util } from "@mateus-pires/file-cache";

await Util.awaitEOS();

await Util.waitUntil(() => x == 2);

// And more...
```

## Roadmap

- [ ] Complete README.md
- [ ] Add tests
- [ ] Make sure it is a stable v1
- [ ] Add CONTRIBUTING.md
- [ ] Add CODE_OF_CONDUCT.md
