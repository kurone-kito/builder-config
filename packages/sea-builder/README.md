# 🟦 `@kurone-kito/sea-builder`

SEA (Single Executable Application) Builder for the Node.js apps

## System Requirements

- Node.js: Any of the following versions
  - Jod LTS (`^22.23.1`)
  - Krypton LTS (`^24.2.0`)
  - Latest (`>=26.0.0`)

## Usage

The package provides two commands: `sea-builder` for building the binary
and `sea-cache` for fetching Node.js archives used by the builder.

### 1. **Cache Node.js archives**

```sh
sea-cache  # cache for current platform
sea-cache linux-x64 win32-x64  # cache archives for multiple targets
```

Archives are downloaded to `node_modules/.cache/xsea` if not already
present.

### 2. **Build the SEA binary**

```sh
# <output> is the base name for the generated file under the `sea/` directory
sea-builder my-cli                                # build for current platform
sea-builder --targets=linux-x64,win32-x64 my-cli  # build for multiple targets
```

If no `--targets` option is given, the current platform and architecture
are used.

### Options

Both commands accept target strings in the format `<platform>-<arch>` such
as `linux-x64` or `win32-x64`. `sea-builder` automatically invokes
`pnpm exec xsea` with the downloaded archives to create the binary under
`sea/<output>`.

`sea-builder` also accepts a `--node` option to choose the Node.js version.
Omitting this option uses the latest patch of the oldest supported LTS line.
Passing `--node=22` is equivalent to specifying `^22`, while
`--node=22.23` behaves like `~22.23`. The resolved version is shown in
the build output.

### Cache directory

All downloaded archives are stored in `node_modules/.cache/xsea`. You can
delete this folder to clear the cache at any time.

## LICENSE

MIT
