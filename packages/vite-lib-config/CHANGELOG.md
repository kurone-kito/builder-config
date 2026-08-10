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
- Bumped dependencies via a grouped Dependabot update (#44).
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

### Fixed

- Restored CI signal on feature branches and pull requests, and
  aligned the `@vitest/coverage-v8` peer with `vitest` v4 (#68).
- Corrected published JSDoc that had the shebang and library-mode
  build branches inverted (#70).

## [0.21.0] - 2025-10-03

### Added

- Added a TypeDoc-based API documentation generation pipeline (#19).

## [0.20.0] - 2025-06-30

### Added

- Initial release (#2).
