---
applyTo: packages/sea-builder/**
---

# SEA Builder Package

This package (`@kurone-kito/sea-builder`) is a CLI tool that builds
Node.js applications into Single Executable Applications (SEA)
across multiple platforms.

## CLI commands

- `sea-builder` — main build command
- `sea-cache` — cache management for downloaded Node.js binaries

## Architecture

```txt
src/
├── builder.mts          # CLI entry: arg parsing → build pipeline
├── cache.mts            # CLI entry: cache management
├── constants.mts        # Cache dirs, xsea CLI config
├── listr2/              # Task factories (listr2-based pipeline)
│   ├── createBuildTasks.mts
│   ├── createCacheTasks.mts
│   ├── createMetaFactory.mts
│   └── createTaskFactory.mts
├── tasks/               # Individual build/cache task implementations
└── utils/               # Pure utility functions
    ├── parseArgs.mts
    ├── downloadArchive.mts
    ├── normalizeTargets.mts
    └── ...
```

## Key constraints

- This is a **published** package
- Supports 6 target platforms: `darwin-arm64`, `darwin-x64`,
  `linux-arm64`, `linux-x64`, `win-arm64`, `win-x64`
- Uses `listr2` for the task-based build pipeline UI
- `xsea` is an optional peer dependency for the actual SEA assembly
- Keep utility functions in `utils/` pure and independently testable
- Test files are co-located as `*.spec.mts`

## When editing

- Run `pnpm -F '@kurone-kito/sea-builder' run test:vitest` for
  unit tests
- For end-to-end validation: `pnpm run build:sea` at the root
  (builds the example-cli as a SEA binary)
