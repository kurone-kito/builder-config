# 🛠️ Builder config

![GitHub package.json version](https://img.shields.io/github/package-json/v/kurone-kito/builder-config)

My configuration for the Vite, TypeScript, and other tools in this monorepo.

## Structure of the monorepo

- ![NPM Downloads](https://img.shields.io/npm/dy/%40kurone-kito%2Fsea-builder)
  [`packages/sea-builder`](packages/sea-builder/README.md):
  SEA (Single Executable Application) Builder for Node.js apps.
  It builds a single executable file from the source code.
  This is useful for CLI applications and other Node.js projects.
- ![NPM Downloads](https://img.shields.io/npm/dy/%40kurone-kito%2Ftypescript-config)
  [`packages/typescript-config`](packages/typescript-config/README.md):
  My TypeScript configuration for general projects.
- ![NPM Downloads](https://img.shields.io/npm/dy/%40kurone-kito%2Fvite-lib-config)
  [`packages/vite-lib-config`](packages/vite-lib-config/README.md):
  Vite configuration for CLI and library projects.

And the example library:

- [`packages/example-cli`](packages/example-cli/README.md):
  Example CLI application using the SEA Builder.
- [`packages/example-lib`](packages/example-lib/README.md):
  Example library for Node.js apps.

## System Requirements

- Node.js: Any of the following versions
  - Iron LTS (`^20.11.x`)
  - Jod LTS (`^22.x.x`)
  - Latest (`>=24.x.x`)

## Development

### Install the dependencies

```sh
corepack enable
pnpm install
```

### Building

```sh
pnpm run build
pnpm run dev # Build and watch for changes
pnpm run build:sea # Build the Single Executable Application(s)
```

### Linting

```sh
pnpm run lint
pnpm run lint:fix # Lint and auto-fix
```

### Testing

```sh
pnpm run test
```

### Cleaning

```sh
pnpm run clean
```

## Contributing

Welcome to contribute to this repository! For more details,
please refer to [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## LICENSE

[MIT](./LICENSE)
