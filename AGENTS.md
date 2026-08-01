# Guidelines for AI Agents

This repository is a pnpm-workspace monorepo that hosts the Node.js
tooling `@kurone-kito/builder-config` maintains and publishes
(`sea-builder`, `vite-lib-config`, `typescript-config`, and the
`example-cli` / `example-lib` packages that exercise them). It is
primarily driven day-to-day with Claude Code, with GitHub Copilot and
CodeRabbit reviewing pull requests. `AGENTS.md` exists so Codex can
still receive the minimum project rules immediately, without
depending on a redirect.

## Setup commands

- Install dependencies: `corepack enable && pnpm install`
- Lint: `pnpm run lint`
- Lint and auto-fix: `pnpm run lint:fix`
- Build: `pnpm run build`
- Test: `pnpm run test`
- Clean: `pnpm run clean`

## Immediate rules

- Match the conversational language to the user's language.
- Write comments and documentation in English unless there is a clear
  project-specific reason otherwise.
- **Always** run `pnpm run lint:fix` after any change, no matter how
  small. Then verify with `pnpm run lint` before committing.
- If uncertainty, hidden risk, or missing context blocks a safe change,
  stop and ask a concise question before proceeding.
- Keep changes small and reviewable. If you create commits, follow the
  project's Conventional Commits rules and keep each commit atomic.
- Do not modify community documents (`CODE_OF_CONDUCT*`,
  `CONTRIBUTING*`) without explicit approval.

## Boundaries

- **Always do**: run lint:fix, follow Conventional Commits, use LF
  line endings, keep commits atomic, write docs in English
- **Ask first**: adding/removing dependencies, changing architecture,
  modifying CI workflows, altering `@kurone-kito/*-config` packages
- **Never do**: commit secrets or credentials, modify community
  documents without approval, disable linter rules without
  justification, skip review of AI-generated code

## Project standards

- **Indentation**: 2 spaces
- **Line endings**: LF only
- **Trailing whitespace**: trimmed except in Markdown
- **Final newline**: always present
- **File naming**: lowercase with hyphens unless a platform convention
  requires otherwise

## Commit rules

This project follows
[Conventional Commits](https://www.conventionalcommits.org/).
A `.gitmessage` template is available at the repository root.
Write user-facing, lowercase subjects, keep them under 72 characters,
and split unrelated changes into separate atomic commits.

## Monorepo guidance

This is a pnpm workspace (`packages/*`): `@kurone-kito/example-cli`,
`@kurone-kito/example-lib`, `@kurone-kito/sea-builder`,
`@kurone-kito/typescript-config`, and `@kurone-kito/vite-lib-config`.
Prefer `pnpm --filter <package>` over root-level commands when working
on a single package.

## Canonical reference

The full, detailed project guidance lives in
[.github/copilot-instructions.md](.github/copilot-instructions.md).
When that file uses Copilot-specific workflow names, apply the intent
in Codex using Codex's own interaction model rather than following the
product terms literally.
