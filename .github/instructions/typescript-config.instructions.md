---
applyTo: packages/typescript-config/**
---

# TypeScript Config Package

This package (`@kurone-kito/typescript-config`) provides a shared,
strict TypeScript configuration consumed by all other packages in
the workspace and by downstream projects.

## Key constraints

- This is a **published** package — changes affect external consumers
- The `tsconfig.json` here is the **single source of truth** for
  TypeScript strictness across all downstream projects
- Do **not** weaken any strict-mode options without explicit approval
  and a `BREAKING CHANGE` footer

## Configuration highlights

- **Target**: ES2023 with `nodenext` module resolution
- **Strict mode**: all strict checks enabled plus
  `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`,
  `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`
- **ESM enforcement**: `verbatimModuleSyntax` and
  `erasableSyntaxOnly` are enabled
- **Monorepo support**: `composite: true` for project references

## When editing

- Validate changes with `pnpm run test:ts` across all packages
- Any option change is effectively a breaking change for consumers —
  treat additions of new strict checks as `feat` and relaxations
  as `feat!` with `BREAKING CHANGE` footer
