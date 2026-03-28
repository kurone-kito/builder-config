---
applyTo: packages/example-cli/**
---

# Example CLI Package

This package (`@kurone-kito/example-cli`) is a minimal CLI
application that validates the full build pipeline: library
consumption, Vite build, and SEA binary generation.

## What it does

- Imports and displays the message from `@kurone-kito/example-lib`
- Built as both an ES module (normal) and a CJS bundle (SEA mode)
- Uses a shebang (`#!/usr/bin/env node`) for direct execution

## Dependencies

- `@kurone-kito/example-lib` — runtime (the message to display)
- `@kurone-kito/sea-builder` — dev (SEA binary generation)
- `@kurone-kito/vite-lib-config` — dev (build configuration)
- `@kurone-kito/typescript-config` — dev (type checking)

## SEA build targets

`darwin-arm64`, `darwin-x64`, `linux-arm64`, `linux-x64`,
`win-arm64`, `win-x64`

## When editing

- Keep this package minimal — it exists to validate tooling
- Test with `pnpm -F '@kurone-kito/example-cli' run test:vitest`
- Full SEA validation: `pnpm run build:sea` at the root
