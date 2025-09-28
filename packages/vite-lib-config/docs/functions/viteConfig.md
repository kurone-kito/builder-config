[**@kurone-kito/vite-lib-config**](../README.md)

***

[@kurone-kito/vite-lib-config](../globals.md) / viteConfig

# Function: viteConfig()

> **viteConfig**(`overrides`, `options`): `UserConfig`

Create a Vite configuration for the current project.

The entry point is `src/index.mts` under the provided working directory.
If the file starts with a shebang(`#!...`), the build uses library mode;
otherwise it performs an SSR build. Additional settings can override
these defaults via mergeConfig.

## Parameters

### overrides

`UserConfig` = `{}`

Additional configuration options to merge with the base
config.

### options

[`ViteConfigOptions`](../interfaces/ViteConfigOptions.md) = `{}`

Options for creating the config, including the working
directory.

## Returns

`UserConfig`

A Vite UserConfig object with the merged configuration.
