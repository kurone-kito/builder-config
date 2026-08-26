# 🛠️ Builder config

My configuration for the Vite, TypeScript, and other tools in this monorepo.

## Structure of the monorepo

- [`packages/sea-builder`](packages/sea-builder/README.md):
  SEA (Single Executable Application) Builder for Node.js apps.
  It builds a single executable file from the source code.
  This is useful for CLI applications and other Node.js projects.
- [`packages/typescript-config`](packages/typescript-config/README.md):
  My TypeScript configuration for general projects.
- [`packages/vite-lib-config`](packages/vite-lib-config/README.md):
  Vite configuration for CLI and library projects.

And the example library:

- [`packages/example-cli`](packages/example-cli/README.md):
  Example CLI application using the SEA Builder.
- [`packages/example-lib`](packages/example-lib/README.md):
  Example library for Node.js apps.

## Related projects

builder-config is a sister project of
[lints-config](https://github.com/kurone-kito/lints-config). The
build-related packages in this repository (`sea-builder`,
`typescript-config`, `vite-lib-config`) were originally part of
lints-config and were later moved and consolidated here. lints-config
still hosts the lint/format tooling this repository's own workflow
depends on: the `@kurone-kito/biome-config`,
`@kurone-kito/commitlint-config`, `@kurone-kito/cspell-config`,
`@kurone-kito/lint-staged-config`, and `@kurone-kito/markdownlint-config`
devDependencies are all published from lints-config.

## System Requirements

- Node.js: Any of the following versions
  - Jod LTS (`^22.23.2`)
  - Krypton LTS (`^24.2.0`)
  - Latest (`>=26.0.0`)

## Development

### Install the dependencies

```sh
corepack enable
pnpm install
```

Node.js 26 and later no longer bundle Corepack. On those versions, install
it from npm first:

```sh
npm install --global corepack
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
