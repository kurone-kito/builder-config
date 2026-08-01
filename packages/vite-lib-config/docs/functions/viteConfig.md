[**@kurone-kito/vite-lib-config**](../README.md)

***

[@kurone-kito/vite-lib-config](../globals.md) / viteConfig

# Function: viteConfig()

> **viteConfig**(`overrides?`, `options?`): `UserConfig`

Create a Vite configuration for the current project.

The entry point is `src/index.mts` under the provided working directory.
Entries that do not exist on disk are filtered out first; if none
remain, the result is an empty configuration. Among the remaining
entries, when every file starts with a shebang(`#!...`), the build
treats them as executables: no `build.lib` and no declaration output.
When any entry does not, the build runs in library mode with
declaration output instead — since the check requires every remaining
entry to have a shebang, a mixed set of entries also falls into
library mode. Both branches build with `ssr: true` unconditionally.
Additional settings can override these defaults via
mergeConfig.

## Parameters

### overrides?

`UserConfig` = `{}`

Additional configuration options to merge with the base
config.

### options?

[`ViteConfigOptions`](../interfaces/ViteConfigOptions.md) = `{}`

Options for creating the config, including the working
directory.

## Returns

`UserConfig`

A Vite UserConfig object with the merged configuration.
