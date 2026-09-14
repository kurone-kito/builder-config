// Under pnpm 12, config-dependency plugins named `@pnpm/plugin-*` (the
// `pnpm-plugin-*` / `@*/pnpm-plugin-*` / `@pnpm/plugin-*` auto-load
// convention) are no longer picked up automatically -- their bundled
// `pnpmfile.cjs` hook is installed under `configDependencies` but never
// invoked unless a workspace-level `.pnpmfile.cjs` explicitly re-exports
// it (see kurone-kito/builder-config#244). This re-export restores
// `@pnpm/plugin-types-fixer`'s `readPackage` hook, which promotes a
// `@types/*` devDependency to `dependencies` (or `peerDependencies`)
// whenever its corresponding runtime package is itself a dependency
// (or peerDependency) -- keeping type declarations available to
// consumers that skip devDependencies. This hook only mutates pnpm's
// in-memory resolution (the lockfile); it does not rewrite a workspace
// package's own committed `package.json`, so a published package still
// needs its own `dependencies` entry moved by hand (see #247's own
// `@types/lodash-es` follow-up in `packages/vite-lib-config`).
// Drop this file once pnpm restores automatic `@pnpm/plugin-*` hook
// auto-loading (re-check the pnpm changelog before removing).
// This file's content is hashed into `pnpm-lock.yaml`'s
// `pnpmfileChecksum`, so even a comment-only edit here requires
// re-running `pnpm install` to keep `--frozen-lockfile` CI passing.
const { hooks } = require('.pnpm-config/@pnpm/plugin-types-fixer/pnpmfile.cjs');

module.exports = { hooks };
