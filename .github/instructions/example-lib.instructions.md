---
applyTo: packages/example-lib/**
---

# Example Library Package

This package (`@kurone-kito/example-lib`) is a minimal library that
validates the shared config packages (`typescript-config` and
`vite-lib-config`) work correctly.

## What it does

Exports a single default string: `'Hello, world!'`

## Purpose

- **Not published** — exists purely for validation and demonstration
- Serves as the simplest possible test case for the Vite library
  build pipeline
- Consumed by `@kurone-kito/example-cli` at runtime

## When editing

- Keep this package minimal — it exists to validate tooling, not to
  implement real features
- Test with `pnpm -F '@kurone-kito/example-lib' run test:vitest`
- After changes, verify `example-cli` still works:
  `pnpm -F '@kurone-kito/example-cli' run test:vitest`
