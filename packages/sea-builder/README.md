# 🟦 `@kurone-kito/sea-builder`

SEA (Single Executable Application) Builder for the Node.js apps

## System Requirements

- Node.js: Any of the following versions
  - Jod LTS (`^22.23.2`)
  - Krypton LTS (`^24.2.0`)
  - Latest (`>=26.0.0`)

## Usage

The package provides two commands: `sea-builder` for building the binary
and `sea-cache` for fetching Node.js archives used by the builder.

### 1. **Cache Node.js archives**

```sh
sea-cache  # cache for current platform
sea-cache linux-x64 win-x64  # cache archives for multiple targets
```

Archives are downloaded to a `.cache/xsea` folder inside your home
directory (`os.homedir()`) if not already present.

### 2. **Build the SEA binary**

```sh
# <output> is the base name for the generated file under the `sea/` directory
sea-builder my-cli                                # build for current platform
sea-builder --targets=linux-x64,win-x64 my-cli  # build for multiple targets
```

If no `--targets` option is given, the current platform and architecture
are used.

### Options

Both commands accept target strings in the nodejs.org archive format
`<platform>-<arch>` such as `linux-x64` or `win-x64`. Omitted targets
and caller-supplied Node platform/arch spellings are mapped onto that
vocabulary (the Windows platform id becomes `win`, `ia32` becomes `x86`
on Windows, and Linux `arm` becomes `armv7l`). `sea-builder` automatically
invokes `pnpm exec xsea` with the downloaded archives to create the
binary under `sea/<output>`.

`sea-builder` also accepts a `--node` option to choose the Node.js version.
Omitting this option uses the latest patch of the oldest supported LTS line.
Passing `--node=22` is equivalent to specifying `^22`, while
`--node=22.23` behaves like `~22.23`. The resolved version is shown in
the build output.

### Cache directory

All downloaded archives are stored in your home directory's
`.cache/xsea` folder — the same location `xsea` itself reads them from.
When `sea-cache`/`sea-builder`
populate an entry, the archive is downloaded and SHA-256-verified before
`xsea` ever sees it, so `xsea` links exactly the bytes that passed
verification. This is a fixed location outside any project directory:

- Each package's `clean` script no longer clears this cache (it only
  removes project-local build artifacts). Run
  `pnpm exec xsea --clean` to clear it, or delete the folder directly.
- The cache is shared across every project on the machine rather than
  being per-project. This is safe because entries are keyed by Node.js
  version and target, so different projects pinning different versions
  do not collide.
- An archive already present in this directory — for example, from
  running `xsea` directly instead of through `sea-cache`/`sea-builder` —
  is treated as a cache hit like any pre-populated cache entry and is not
  re-verified.

## LICENSE

MIT
