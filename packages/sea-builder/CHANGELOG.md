# Changelog

All notable changes to this project will be documented in this file.

The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `CHANGELOG.md` (#112).
- Added the `node-releases` dependency, used to determine whether an
  LTS line's support window has already ended (#59).

### Changed

- Bumped the `cpy-cli` devDependency to v7 (#41).
- Bumped the `semver` dependency to `^7.8.1` (#42).
- Bumped the `undici` devDependency to `7.24.0` and `vitest` to
  `^4.1.0` (#44).
- Bumped the `undici` devDependency to v7.28.0 (#66).
- Removed the unused, exact-pinned `undici` devDependency (#75).
- **Breaking:** raised the `engines.node` floor from
  `^20.11 || ^22 || >=24` to `^22.23.2 || ^24.2.0 || >=26.0.0`,
  dropping Node.js 20, Node.js 22 below 22.23.2, Node.js 24 below
  24.2.0, and every Node.js 25 release; bumped pnpm to v11 (#88).
- Bumped the `typescript` devDependency to `~6.0.3` (#113).
- Bumped the `vite` devDependency to `^8.0.0` (#121).

### Fixed

- Forwarded the resolved `--node` version to xsea as `-N` when linking
  the SEA binary, so the emitted binary matches the version the cache
  task downloaded instead of the Node.js running `sea-builder` (#155).
- Restored CI signal on feature branches and pull requests, and
  aligned the `@vitest/coverage-v8` peer with `vitest` v4 (#68).
- Fixed the `env` shebang with a multi-word argument on Linux by
  passing it with `-S` (#71).
- Verified downloaded Node.js archives against their published
  checksum before caching, and stopped writing directly into the
  permanent download cache (#72).
- Stopped `devPreinstall` from executing unpinned `pnpm dlx` packages
  (#76).
- Made `--node`'s omitted default match its documentation: `sea-builder`
  now actually resolves the latest patch of the oldest **currently
  supported** (not end-of-life) LTS line when the option isn't passed,
  instead of silently embedding whatever Node.js version happened to
  run the build, making SEA builds reproducible across machines. An
  earlier version of this fix still picked the oldest LTS line in
  `all-node-versions`' history regardless of whether it was still
  supported, which resolved to Node.js 4 (end-of-life since 2018); the
  `node-releases` support-window check above closes that gap. The
  resolved version is now also shown in the build output.
  `sea-cache`'s own omitted-version default now goes through the same
  resolution as `sea-builder`'s, so the two commands agree on which
  archive to fetch when neither specifies an explicit version (#59).

## [0.21.0] - 2025-10-03

### Changed

- Bumped the `listr2` dependency to `^9.0.4` (#19).
- Bumped the `cpy-cli` devDependency to `^6.0.0`, `type-fest` to
  `^5.0.1` (a major bump), `typescript` to `~5.9.3`, `undici` to
  `7.16.0`, and `vite` to `^7.1.9` (#19).

## [0.20.0] - 2025-06-30

### Added

- Initial release (#2).
