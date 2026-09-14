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
// consumers that skip devDependencies.
const { hooks } = require('.pnpm-config/@pnpm/plugin-types-fixer/pnpmfile.cjs');

module.exports = { hooks };
