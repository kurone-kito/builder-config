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
- **Breaking:** migrated the Node.js baseline from LTS Iron (v20) to
  LTS Jod (v22), and pnpm to v11 (#88).
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
