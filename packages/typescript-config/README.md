# 🟦 `@kurone-kito/typescript-config`

My TypeScript configuration for general Node.js projects.

## System Requirements

- Node.js: Any of the following versions
  - Jod LTS (`^22.23.1`)
  - Krypton LTS (`^24.2.0`)
  - Latest (`>=26.0.0`)
- TypeScript: `>=7.0.0`

## Usage

First, install this package and its peer dependencies:

```sh
npm install --save-dev \
  @kurone-kito/typescript-config \
  typescript
```

Then, create a `tsconfig.json` file.
If exists, merge the following configuration into it:

```json
{
  "extends": "@kurone-kito/typescript-config"
}
```

### Example

The [example CLI project](../example-cli/tsconfig.json) extends this
configuration and adds settings for the output directory and additional
libraries:

```json
{
  "extends": "@kurone-kito/typescript-config",
  "compilerOptions": {
    "lib": ["DOM", "ES2024"],
    "outDir": "dist",
    "rootDir": "src"
  },
  "exclude": [
    "**/*.config.mts",
    "**/*.spec.mts",
    "coverage",
    "dist",
    "node_modules"
  ]
}
```

### Recommended settings

- Set `outDir` and `rootDir` to keep compiled files separate from sources.
- Include `types: ["node"]` when targeting Node.js.

## LICENSE

MIT
