# v1.1.0

Changes:

- Got rid of `tslib`, `tsc` and all its extra runtime computation
- `Store` now its faster and lighter in querying and loading, thanks to its new [`[Symbol.asyncIterator]`](https://mateus-p.github.io/file-cache/classes/Store.html#_asyncIterator_)
- `bindQuery` now supports AsyncIterators

New features:

- [`static Metadata#fromBuffer`](https://mateus-p.github.io/file-cache/classes/Metadata.html#fromBuffer)
- [`Store#[Symbol.asyncIterator]`](https://mateus-p.github.io/file-cache/classes/Store.html#_asyncIterator_)

## v1.0.1

Fixes:

- Fixed `Store#delete` not deleting meta files

## v1.0.0

First release
