# ⚡️ `@kurone-kito/vite-lib-config`

Vite configuration for CLI and library projects

## System Requirements

- Node.js: Any of the following versions
  - Iron LTS (`^20.11.x`)
  - Jod LTS (`^22.x.x`)
  - Latest (`>=24.x.x`)

## Usage

```ts
import { viteConfig } from '@kurone-kito/vite-lib-config';

export default viteConfig();
```

### Example

The `@kurone-kito/sea-builder` defines multiple entry points for building
several binaries at once:

```ts
import { viteConfig } from '@kurone-kito/vite-lib-config';

export default viteConfig(undefined, {
  entries: ['builder.mts', 'cache.mts'],
});
```

### Recommended settings

- Override `entries` to specify multiple input files.
- Use the `overrides` parameter to merge additional Vite options when
  necessary.

## API

### `viteConfig(overrides?, options?)`

Creates a Vite configuration for building a library or CLI.

- **`overrides`**: `UserConfig` - Additional Vite configuration to merge
  with the base config.
- **`options`**: `ViteConfigOptions` - Options for creating the config.

### `vitestConfig(overrides?, options?)`

Creates a Vitest configuration for running tests.

- **`overrides`**: `ViteUserConfig` - Additional Vitest configuration to
  merge with the base config.
- **`options`**: `ViteConfigOptions` - Options for creating the config.

### `ViteConfigOptions`

An object with the following properties:

- **`cwd`**: `string` (optional) - The base directory of the project.
  Defaults to `process.cwd()`.
- **`entries`**: `string | string[]` (optional) - The entry file(s)
  relative to `srcDir`. Defaults to `'index.mts'`.
- **`srcDir`**: `string` (optional) - The directory where source files are
  located. Defaults to `'src'`.

## LICENSE

MIT
