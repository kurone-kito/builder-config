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
- **Breaking:** raised the `engines.node` floor from
  `^20.11 || ^22 || >=24` to `^22.23.1 || ^24.2.0 || >=26.0.0`,
  dropping Node.js 20, Node.js 22 below 22.23.1, Node.js 24 below
  24.2.0, and every Node.js 25 release; bumped pnpm to v11 (#88).
- Bumped the `typescript` devDependency to `~6.0.3` (#113).

## [0.21.0] - 2025-10-03

### Changed

- **Breaking:** enabled `erasableSyntaxOnly`, which rejects TypeScript
  syntax that requires emit-time transformation (enums, parameter
  properties, legacy `namespace`/`module` with runtime code, etc.)
  (#19). This option requires TypeScript 5.8+; the advertised
  `peerDependencies` range (`>=5.7.x`) was not updated, so consumers
  on TypeScript 5.7 must upgrade their compiler to avoid an unknown
  compiler option error.
- Bumped the `cpy-cli` devDependency to `^6.0.0` and `typescript` to
  `~5.9.3` (#19).

## [0.20.0] - 2025-06-30

### Added

- Migrated from `kurone-kito/lints-config` (#2); its pre-migration
  history will be backfilled in a follow-up (#108).
