[**@kurone-kito/vite-lib-config**](../README.md)

***

[@kurone-kito/vite-lib-config](../globals.md) / vitestConfig

# Function: vitestConfig()

> **vitestConfig**(`overrides`, `options`): `UserConfig`

Create a Vitest configuration for the current project.

Merges a `test.environment: 'node'` default under the [viteConfig](viteConfig.md)
produced for the same entry point, so Vitest inherits the same build
settings the project builds with. Additional settings can override
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

A Vitest ViteUserConfig object with the merged
configuration.
