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
- Bumped the `semver` dependency to `^7.8.1` (#42).
- Bumped dependencies via a grouped Dependabot update (#44).
- Bumped the `undici` devDependency to v7.24.0 (#45).
- Bumped the `undici` devDependency to v7.28.0 (#66).
- Removed the unused, exact-pinned `undici` devDependency (#75).
- **Breaking:** migrated the Node.js baseline from LTS Iron (v20) to
  LTS Jod (v22), and pnpm to v11 (#88).
- Bumped the `typescript` devDependency to `~6.0.3` (#113).

### Fixed

- Restored CI signal on feature branches and pull requests, and
  aligned the `@vitest/coverage-v8` peer with `vitest` v4 (#68).
- Fixed the `env` shebang with a multi-word argument on Linux by
  passing it with `-S` (#71).
- Verified downloaded Node.js archives against their published
  checksum before caching, and stopped writing directly into the
  permanent download cache (#72).
- Stopped `devPreinstall` from executing unpinned `pnpm dlx` packages
  (#76).

## [0.20.0] - 2025-06-30

### Added

- Initial release (#2).
