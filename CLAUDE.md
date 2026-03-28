# Guidelines for AI Agents

This project provides shared build tooling and configuration
packages for Node.js projects. It is optimized for GitHub Copilot
tooling, but `CLAUDE.md` exists so Claude Code can receive the
project rules immediately.

## Setup commands

- Install dependencies: `corepack enable && pnpm install`
- Build all packages: `pnpm run build`
- Lint and auto-fix: `pnpm run lint:fix`
- Lint (verify): `pnpm run lint`
- Unit tests: `pnpm run test:vitest`
- Type check: `pnpm run test:ts`
- All tests: `pnpm run test`
- SEA build: `pnpm run build:sea`
- Clean: `pnpm run clean`

## Immediate rules

- Match the conversational language to the user's language.
- Write comments and documentation in English unless there is a
  clear project-specific reason otherwise.
- **Always** run `pnpm run lint:fix` after any change, no matter
  how small. Then verify with `pnpm run lint` before committing.
- If uncertainty, hidden risk, or missing context blocks a safe
  change, stop and ask a concise question before proceeding.
- Keep changes small and reviewable. If you create commits, follow
  the project's Conventional Commits rules and keep each commit
  atomic.
- Do not modify community documents (`CODE_OF_CONDUCT*`,
  `CONTRIBUTING*`) without explicit approval.

## Boundaries

- **Always do**: run lint:fix, follow Conventional Commits, use LF
  line endings, keep commits atomic, write docs in English
- **Ask first**: adding/removing dependencies, changing architecture,
  modifying CI workflows, altering `@kurone-kito/*-config` packages,
  changing public API of published packages
- **Never do**: commit secrets or credentials, modify community
  documents without approval, disable linter rules without
  justification, skip review of AI-generated code, weaken strict
  TypeScript options

## Tech stack

- **Runtime**: Node.js ^20.18 || ^22 || >=24
- **Language**: TypeScript ~6.0 (strict, `verbatimModuleSyntax`)
- **Bundler**: Vite 8 | **Test**: Vitest 4 | **Lint**: Biome 2
- **Module style**: ESM only (`.mts` extension)

## Packages

| path | package | published |
| ---- | ------- | --------- |
| `/packages/typescript-config` | `@kurone-kito/typescript-config` | ✅ |
| `/packages/vite-lib-config` | `@kurone-kito/vite-lib-config` | ✅ |
| `/packages/sea-builder` | `@kurone-kito/sea-builder` | ✅ |
| `/packages/example-lib` | `@kurone-kito/example-lib` | ❌ |
| `/packages/example-cli` | `@kurone-kito/example-cli` | ❌ |

## Commit rules

This project follows
[Conventional Commits](https://www.conventionalcommits.org/).
A `.gitmessage` template is available at the repository root.
Write user-facing, lowercase subjects, keep them under 72
characters, and split unrelated changes into separate atomic
commits. Use package directory names as scopes:
`feat(sea-builder):`, `fix(vite-lib-config):`

## Canonical reference

The full, Copilot-first project guidance lives in
[.github/copilot-instructions.md](.github/copilot-instructions.md).
When that file uses Copilot-specific workflow names, apply the
intent in Claude Code using its own interaction model rather than
following the product terms literally.
