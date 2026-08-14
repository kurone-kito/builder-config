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
  `^20.11 || ^22 || >=24` to `^22.23.2 || ^24.2.0 || >=26.0.0`,
  dropping Node.js 20, Node.js 22 below 22.23.2, Node.js 24 below
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
  history (`0.1.2`–`0.19.0`) is recorded below.

## [0.19.0] - 2025-06-08

_Released as part of
[kurone-kito/lints-config@v0.19.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.19.0)
before this package migrated to this repository._

### Changed

- **Breaking:** added an explicit `lib: ["ES2023"]` compiler option.
  TypeScript replaces its default library set with an explicit `lib`
  array rather than augmenting it, so consumers who don't override
  `lib` themselves lose the `DOM`/`DOM.Iterable`/`ScriptHost` globals
  (`window`, `document`, `fetch`, etc.) that `target`'s default
  inference had been including; such consumers must now add `DOM`
  explicitly if they need it (kurone-kito/lints-config#111).
- Bumped `target` from `ES2022` to `ES2023`
  (kurone-kito/lints-config#111).

## [0.18.0] - 2025-05-20

_Released as part of
[kurone-kito/lints-config@v0.18.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.18.0)
before this package migrated to this repository._

### Added

- Added the `rimraf` devDependency (`^6.0.1`)
  (kurone-kito/lints-config#110).

### Removed

- Removed the `typescript-eslint-language-service` compiler plugin
  entry from `tsconfig.json`. Dropped `@typescript-eslint/parser` and
  `typescript-eslint-language-service` from both `peerDependencies`
  and `devDependencies`, and `eslint` from `devDependencies` only (it
  was never a peer dependency); also removed the matching README
  install command line (kurone-kito/lints-config#110).

### Changed

- **Breaking:** raised the `engines.node` floor from
  `^18.20 || ^20.10 || >=22` to `^20.11 || >=22`, dropping Node.js 18
  and the previously-supported Node.js 20.10 line
  (kurone-kito/lints-config#110).

## [0.17.3] - 2024-12-15

_Released as part of
[kurone-kito/lints-config@v0.17.3](https://github.com/kurone-kito/lints-config/releases/tag/v0.17.3)
before this package migrated to this repository._

### Changed

- Maintenance update; no functional change to this package
  (kurone-kito/lints-config#109).

## [0.17.2] - 2024-12-14

_Released as part of
[kurone-kito/lints-config@v0.17.2](https://github.com/kurone-kito/lints-config/releases/tag/v0.17.2)
before this package migrated to this repository._

### Removed

- Removed the `concurrently` devDependency, no longer needed now that
  `prepack` runs `pnpm run clean && pnpm run build` directly instead
  of via Yarn and `concurrently` (kurone-kito/lints-config#108).

### Changed

- Bumped the `@typescript-eslint/parser` peerDependency range to
  `>=8.x.x` and its devDependency to `^8.18.0`, the `typescript`
  devDependency to `~5.7.2`, and `eslint` to `^9.17.0`
  (kurone-kito/lints-config#108).

## [0.16.1] - 2024-09-09

_Released as part of
[kurone-kito/lints-config@v0.16.1](https://github.com/kurone-kito/lints-config/releases/tag/v0.16.1)
before this package migrated to this repository._

### Changed

- **Breaking:** raised the `engines.node` floor from `>=18` to
  `^18.20 || ^20.10 || >=22`, dropping Node.js 18 below 18.20, every
  Node.js 19 release, Node.js 20 below 20.10, and every Node.js 21
  release (kurone-kito/lints-config#92).

## [0.16.0] - 2024-08-20

_Released as part of
[kurone-kito/lints-config@v0.16.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.16.0)
before this package migrated to this repository._

### Changed

- Maintenance update; no functional change to this package
  (kurone-kito/lints-config#91).

## [0.15.0] - 2024-08-17

_Released as part of
[kurone-kito/lints-config@v0.15.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.15.0)
before this package migrated to this repository._

### Changed

- Maintenance update; no functional change to this package
  (kurone-kito/lints-config#90).

## [0.14.0] - 2024-08-04

_Released as part of
[kurone-kito/lints-config@v0.14.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.14.0)
before this package migrated to this repository._

### Added

- Added `@typescript-eslint/parser` as a peer dependency
  (`>=6.x.x`, optional) (kurone-kito/lints-config#89).

### Removed

- Removed Prettier entirely from this package's own dev tooling: the
  top-level `prettier` config-pointer field, the shared
  `@kurone-kito/prettier-config` devDependency, and the `prettier`
  devDependency itself (kurone-kito/lints-config#89).

### Changed

- Bumped the devDependency `@typescript-eslint/parser` to `^8.0.0`
  and `typescript` to `~5.5.4` (kurone-kito/lints-config#89).

## [0.13.0] - 2024-07-16

_Released as part of
[kurone-kito/lints-config@v0.13.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.13.0)
before this package migrated to this repository._

### Changed

- **Breaking:** narrowed the `typescript` peer dependency range from
  `>=4.7.x` to `>=5.x.x`, dropping TypeScript 4.x support
  (kurone-kito/lints-config#87).
- Removed the `newLine: "LF"` compiler option and bumped
  `@typescript-eslint/parser` to `^7.16.1` and `typescript` to
  `~5.5.3` (kurone-kito/lints-config#87).

## [0.12.0] - 2024-06-19

_Released as part of
[kurone-kito/lints-config@v0.12.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.12.0)
before this package migrated to this repository._

### Changed

- Reworked the release scripts: added a `build` script
  (`cpy "../../LICENSE" "typescript-config/LICENSE"`) and changed
  `prepack` to run it via `concurrently`; bumped
  `@typescript-eslint/parser` to `^7.13.1`
  (kurone-kito/lints-config#80).

## [0.11.1] - 2024-06-07

_Released as part of
[kurone-kito/lints-config@v0.11.1](https://github.com/kurone-kito/lints-config/releases/tag/v0.11.1)
before this package migrated to this repository._

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^7.12.0`
  and `prettier` to `^3.3.1` (kurone-kito/lints-config#79).

## [0.11.0] - 2024-05-13

_Released as part of
[kurone-kito/lints-config@v0.11.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.11.0)
before this package migrated to this repository._

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^7.8.0`
  and `typescript` to `~5.4.5` (kurone-kito/lints-config#73).

## [0.10.0] - 2024-04-13

_Released as part of
[kurone-kito/lints-config@v0.9.1](https://github.com/kurone-kito/lints-config/releases/tag/v0.9.1)
before this package migrated to this repository. The git tag and
GitHub Release are both named `v0.9.1`, but the published
`package.json` version — and the npm registry — say `0.10.0`; this
heading follows what was actually published._

### Removed

- Removed the redundant `module: "tsconfig.json"` field from
  `package.json` (kurone-kito/lints-config#66).

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^7.6.0`
  and `typescript` to `~5.4.4` (kurone-kito/lints-config#66).

## [0.9.0] - 2024-03-14

_Released as part of
[kurone-kito/lints-config@v0.9.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.9.0)
before this package migrated to this repository._

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^7.2.0`,
  `prettier` to `^3.2.5`, and `typescript` to `~5.4.2`
  (kurone-kito/lints-config#61, kurone-kito/lints-config#62,
  kurone-kito/lints-config#64, kurone-kito/lints-config#65).

## [0.8.4] - 2023-12-05

_Released as part of
[kurone-kito/lints-config@v0.8.4](https://github.com/kurone-kito/lints-config/releases/tag/v0.8.4)
before this package migrated to this repository._

### Changed

- Version bump only; no functional change to this package
  (kurone-kito/lints-config#60).

## [0.8.3] - 2023-12-05

_Released as part of
[kurone-kito/lints-config@v0.8.3](https://github.com/kurone-kito/lints-config/releases/tag/v0.8.3)
before this package migrated to this repository. This version was
never published to the npm registry (only `0.8.2` and `0.8.4` are
present); dated from the git tag rather than an npm publish
timestamp._

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^6.13.2`
  (kurone-kito/lints-config#59).

## [0.8.2] - 2023-12-03

_Released as part of
[kurone-kito/lints-config@v0.8.2](https://github.com/kurone-kito/lints-config/releases/tag/v0.8.2)
before this package migrated to this repository._

### Changed

- Reworked the `clean` script's argument order; bumped the
  `@typescript-eslint/parser` devDependency to `^6.13.1`, `eslint` to
  `^8.55.0`, `prettier` to `^3.1.0`, and `typescript` to `~5.3.2`
  (kurone-kito/lints-config#58).

## [0.8.1] - 2023-11-12

_Released as part of
[kurone-kito/lints-config@v0.8.1](https://github.com/kurone-kito/lints-config/releases/tag/v0.8.1)
before this package migrated to this repository._

### Added

- Added an explicit `"license": "MIT"` field to `package.json`
  (kurone-kito/lints-config#57).

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^6.10.0`
  and `eslint` to `^8.53.0` (kurone-kito/lints-config#57).

## [0.8.0] - 2023-10-21

_Released as part of
[kurone-kito/lints-config@v0.8.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.8.0)
before this package migrated to this repository._

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^6.8.0` and
  `eslint` to `^8.52.0` (kurone-kito/lints-config#56).

## [0.7.6] - 2023-10-05

_Released as part of
[kurone-kito/lints-config@v0.7.6](https://github.com/kurone-kito/lints-config/releases/tag/v0.7.6)
before this package migrated to this repository._

### Added

- Added a `prepack` script that copies the repository's `LICENSE`
  file into the package via the new `cpy-cli` devDependency
  (kurone-kito/lints-config#55).

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^6.7.4` and
  `eslint` to `^8.50.0` (kurone-kito/lints-config#55).

## [0.7.5] - 2023-09-21

_Released as part of
[kurone-kito/lints-config@v0.7.5](https://github.com/kurone-kito/lints-config/releases/tag/v0.7.5)
before this package migrated to this repository._

### Changed

- **Breaking:** raised the `engines.node` floor from `>=16.20` to
  `>=18`, dropping Node.js 16 and every Node.js 17 release
  (kurone-kito/lints-config#49).
- Bumped the `@typescript-eslint/parser` devDependency to `^6.7.2`,
  `eslint` to `^8.49.0`, and `prettier` to `^3.0.3`
  (kurone-kito/lints-config#49).

## [0.7.4] - 2023-08-25

_Released as part of
[kurone-kito/lints-config@v0.7.4](https://github.com/kurone-kito/lints-config/releases/tag/v0.7.4)
before this package migrated to this repository._

### Changed

- **Breaking:** added an explicit `exports` map restricting resolvable
  subpaths to `.` and `./tsconfig.json` only (both pointing at
  `tsconfig.json`), and a `module` field pointing at the same file.
  Node.js rejects any other subpath import (e.g.
  `@kurone-kito/typescript-config/package.json`) with
  `ERR_PACKAGE_PATH_NOT_EXPORTED` once an `exports` map is present,
  where it previously resolved (kurone-kito/lints-config#43).
- Bumped the `@typescript-eslint/parser` devDependency to `^6.4.1`,
  `eslint` to `^8.47.0`, `prettier` to `^3.0.2`, and `typescript` to
  `~5.2.2` (kurone-kito/lints-config#43).

## [0.7.3] - 2023-08-11

_Released as part of
[kurone-kito/lints-config@v0.7.3](https://github.com/kurone-kito/lints-config/releases/tag/v0.7.3)
before this package migrated to this repository._

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^6.3.0`,
  `eslint` to `^8.46.0`, and `prettier` to `^3.0.1`
  (kurone-kito/lints-config#42).

## [0.7.2] - 2023-07-28

_Released as part of
[kurone-kito/lints-config@v0.7.2](https://github.com/kurone-kito/lints-config/releases/tag/v0.7.2)
before this package migrated to this repository._

### Changed

- Version bump only; no functional change to this package
  (kurone-kito/lints-config#36).

## [0.7.1] - 2023-07-27

_Released as part of
[kurone-kito/lints-config@v0.7.1](https://github.com/kurone-kito/lints-config/releases/tag/v0.7.1)
before this package migrated to this repository. This release also
folded in the untagged `0.7.0` version bump._

### Changed

- Bumped the `@typescript-eslint/parser` devDependency from `^5.60.0`
  to `^6.2.0`, `eslint` to `^8.45.0`, `prettier` from `^2.8.8` to
  `^3.0.0`, and `typescript` to `~5.1.6`
  (kurone-kito/lints-config#34, kurone-kito/lints-config#35).

## [0.6.0] - 2023-06-22

_Released as part of
[kurone-kito/lints-config@v0.6.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.6.0)
before this package migrated to this repository._

### Changed

- Relaxed the `typescript` and `typescript-eslint-language-service`
  peer dependencies from the narrow ranges `~5.1.3` and `^5.0.5` to
  the broad `>=4.7.x` and `>=5.x.x`, and marked both `optional` via
  `peerDependenciesMeta` (kurone-kito/lints-config#25).
- Bumped the `@typescript-eslint/parser` devDependency to `^5.60.0`
  and `eslint` to `^8.43.0` (kurone-kito/lints-config#25).

## [0.5.0] - 2023-06-10

_Released as part of
[kurone-kito/lints-config@v0.5.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.5.0)
before this package migrated to this repository._

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^5.59.9`,
  `eslint` to `^8.42.0`, and `typescript` to `~5.1.3`
  (kurone-kito/lints-config#18, kurone-kito/lints-config#19).

## [0.4.0] - 2023-05-24

_Released as part of
[kurone-kito/lints-config@v0.4.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.4.0)
before this package migrated to this repository. This release also
folded in the untagged `0.3.4` version bump._

### Changed

- **Breaking:** raised the `target` compiler option from `ES2019` to
  `ES2022` (kurone-kito/lints-config#16, kurone-kito/lints-config#17).
- Bumped the `@typescript-eslint/parser` devDependency to `^5.59.7`
  and `eslint` to `^8.41.0` (kurone-kito/lints-config#16).

## [0.3.3] - 2023-05-06

_Released as part of
[kurone-kito/lints-config@v0.3.3](https://github.com/kurone-kito/lints-config/releases/tag/v0.3.3)
before this package migrated to this repository. This release also
folded in the untagged `0.3.1` and `0.3.2` version bumps._

### Changed

- Reformatted the README's install command onto multiple lines;
  bumped the `@typescript-eslint/parser` devDependency to `^5.59.2`
  and `eslint` to `^8.40.0` (kurone-kito/lints-config#13,
  kurone-kito/lints-config#14, kurone-kito/lints-config#15).

## [0.3.0] - 2023-04-24

_Released as part of
[kurone-kito/lints-config@v0.3.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.3.0)
before this package migrated to this repository._

### Changed

- **Breaking:** raised the `engines.node` floor from `>=14.21` to
  `>=16.20`, dropping Node.js 14, every Node.js 15 release, and
  Node.js 16 below 16.20 (kurone-kito/lints-config#12).
- Bumped the `@typescript-eslint/parser` devDependency to `^5.59.1`
  and `prettier` to `^2.8.8` (kurone-kito/lints-config#12).

## [0.2.8] - 2023-04-22

_Released as part of
[kurone-kito/lints-config@v0.2.8](https://github.com/kurone-kito/lints-config/releases/tag/v0.2.8)
before this package migrated to this repository._

### Changed

- Bumped the `@typescript-eslint/parser` devDependency to `^5.59.0`
  and `typescript` to `~5.0.4` (kurone-kito/lints-config#11).

## [0.2.7] - 2023-04-07

_Released as part of
[kurone-kito/lints-config@v0.2.7](https://github.com/kurone-kito/lints-config/releases/tag/v0.2.7)
before this package migrated to this repository. This release also
folded in the untagged `0.2.1`, `0.2.4`, `0.2.5`, and `0.2.6` version
bumps, which fixed a broken `publishConfig` that had blocked public
npm publishing since `0.2.0` (kurone-kito/lints-config#8,
kurone-kito/lints-config#9); `0.2.4` was itself a failed publish
attempt during that fix (lints-config's own release for `0.2.5` is
titled "0.2.5: Republish"), and the first version that actually
installs from npm in this range is `0.2.5`._

### Changed

- Flipped `publishConfig.access` from `restricted` to `public`,
  making this package installable from the public npm registry for
  the first time (kurone-kito/lints-config#8,
  kurone-kito/lints-config#9).
- Added a `clean` script; bumped the `@typescript-eslint/parser`
  devDependency to `^5.57.1`, `typescript` to `~5.0.3`, and
  `typescript-eslint-language-service` to `^5.0.5`
  (kurone-kito/lints-config#4, kurone-kito/lints-config#10).

### Removed

- Removed `forceConsistentCasingInFileNames` and `incremental` (both
  present since `0.1.2`), and `importsNotUsedAsValues` and
  `preserveValueImports` (both added in the `0.2.0` range above)
  (kurone-kito/lints-config#10).

## [0.2.0] - 2023-03-29

_Released as part of
[kurone-kito/lints-config@v0.2.0](https://github.com/kurone-kito/lints-config/releases/tag/v0.2.0)
before this package migrated to this repository. This version was
never successfully published to the npm registry — a broken
`publishConfig` blocked every publish attempt in this range until it
was fixed in the `0.2.7` range above; nobody could `npm install` this
exact version._

### Added

- Enabled `allowJs`, `checkJs`, `composite`,
  `exactOptionalPropertyTypes`, `importsNotUsedAsValues: "error"`,
  `isolatedModules`, `noEmitOnError`, `noErrorTruncation`,
  `noUnusedLocals`, `preserveValueImports`, and `stripInternal`;
  enabled `typeAcquisition.enable` (kurone-kito/lints-config#3).

### Changed

- Switched `module`/`moduleResolution` from `ESNext`/`node` to
  `nodenext`; bumped the `@typescript-eslint/parser` devDependency to
  `^5.57.0`, `eslint` to `^8.37.0`, `prettier` to `^2.8.7`, and
  `typescript-eslint-language-service` to `^5.0.3`
  (kurone-kito/lints-config#3).

### Removed

- Removed `declaration`, `emitDecoratorMetadata`, and
  `experimentalDecorators` (kurone-kito/lints-config#3).

## [0.1.2] - 2023-03-22

_Earliest git-tagged release, as part of
[kurone-kito/lints-config@v0.1.2](https://github.com/kurone-kito/lints-config/releases/tag/v0.1.2)
before this package migrated to this repository. The package was
first published as `0.1.0` (2023-03-21), an untagged version with no
distinct `package.json` commit of its own; this entry's content covers
everything since the package's introduction
(kurone-kito/lints-config#2)._

### Added

- Introduced the package: a `tsconfig.json` extending base with a
  `typescript-eslint-language-service` compiler plugin, `strict`
  compiler options, `target: "ES2019"`, and a `typescript` peer
  dependency set to the narrow range `~5.0.2` (kurone-kito/lints-config#2).
