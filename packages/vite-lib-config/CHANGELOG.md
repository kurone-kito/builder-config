# Changelog

All notable changes to this project will be documented in this file.

The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `CHANGELOG.md` (#112).

### Changed

- Bumped the `cpy-cli` devDependency to v7 (#41).
- Bumped the `vitest` devDependency to `^4.1.0` (#44).
- **Breaking:** raised the `engines.node` floor from
  `^20.11 || ^22 || >=24` to `^22.23.1 || ^24.2.0 || >=26.0.0`,
  dropping Node.js 20, Node.js 22 below 22.23.1, Node.js 24 below
  24.2.0, and every Node.js 25 release; bumped pnpm to v11 (#88).
- **Breaking:** raised the shared `viteConfig`'s Vite build target
  from `node20.11` to `node22.23`. Any package built through this
  config — including this repository's own `sea-builder` — may now
  emit syntax unsupported on Node.js 20, even when the build itself
  runs on a supported Node.js version (#88).
- Bumped the `typescript` devDependency to `~6.0.3` (#113).
- **Breaking:** bumped the `vite` dependency from `^7.1.9` to
  `^8.0.0`, and `vite-plugin-dts` from `^4.5.4` to `^5.0.1`. Renamed
  `build.rollupOptions` to `build.rolldownOptions` in the shared
  `viteConfig`, matching Vite 8's Rolldown-based bundler, and removed
  the `build.rollupOptions.output.importAttributesKey` option —
  Rolldown's `OutputOptions` has no equivalent, so downstream
  consumers of the published `viteConfig()` that relied on it to
  control emitted import-attribute syntax (the `with { type: ... }` /
  `assert { type: ... }` forms) must drop that reliance (#121).

### Fixed

- Restored CI signal on feature branches and pull requests, and
  aligned the `@vitest/coverage-v8` peer with `vitest` v4 (#68).
- Corrected the published API documentation for `viteConfig` and
  `vitestConfig`. `viteConfig`'s JSDoc had the shebang/library-mode
  branches inverted and omitted that nonexistent entries are filtered
  out first (an empty result after filtering yields an empty
  configuration) and that a mixed set of entries falls into library
  mode; `vitestConfig`'s JSDoc had incorrectly described the same
  shebang/library-mode logic instead of its actual behavior — merging
  a `test.environment: 'node'` default under the `viteConfig` built
  for the same entry point (#70).
- Resolved `typedoc-plugin-markdown` explicitly to avoid a lookup
  failure under pnpm's global virtual store, and added external link
  mappings for Vite's `UserConfig`/`mergeConfig` symbols in the
  generated API docs (#88).

## [0.21.0] - 2025-10-03

### Added

- Added a TypeDoc-based API documentation generation pipeline (#19).

### Changed

- Bumped the `type-fest` dependency to `^5.0.1` (a major bump; used
  by the exported `ViteConfigOptions` type) and `vite` to `^7.1.9`
  (#19).
- Bumped the `cpy-cli` devDependency to `^6.0.0` and `typescript` to
  `~5.9.3` (#19).

## [0.20.0] - 2025-06-30

### Added

- Initial release (#2).
