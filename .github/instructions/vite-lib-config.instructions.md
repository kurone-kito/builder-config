---
applyTo: packages/vite-lib-config/**
---

# Vite Library Config Package

This package (`@kurone-kito/vite-lib-config`) provides factory
functions for Vite and Vitest configuration, used by all buildable
packages in the workspace and by downstream projects.

## Exports

- `viteConfig(overrides?, options?)` — Vite build configuration
  factory for ES module libraries and CJS SEA builds
- `vitestConfig(overrides?, options?)` — Vitest test configuration
  factory with Node.js environment

## Key options

- `cwd`: working directory (default: `cwd()`)
- `entries`: entry files (default: `['index.mts']`)
- `srcDir`: source directory (default: `'src'`)
- `target`: build targets (default: `['node20.20', 'es2023']`)
- `sea`: enable SEA (Single Executable App) build mode

## Key constraints

- This is a **published** package — changes affect external consumers
- The factory auto-detects CLI vs library mode via shebang detection
- SEA mode produces CJS bundles; library mode produces ES modules
- `vite-plugin-dts` generates `.d.mts` type declarations
  automatically

## When editing

- Test changes with `pnpm -F '@kurone-kito/vite-lib-config' run
  test:vitest`
- After modifying the config factory, rebuild and test all consuming
  packages (`pnpm run build && pnpm run test:vitest`)
- Avoid breaking the public API signature without a
  `BREAKING CHANGE` footer
