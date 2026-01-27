# Guidelines for AI Agents

This project is a pnpm monorepo workspace template with sample
packages for CLI, library, and web applications.
It is currently optimized for GitHub Copilot tooling, but `GEMINI.md`
exists so Gemini CLI can still receive the minimum project rules
immediately, without depending on a redirect.

## Setup commands

- Install dependencies: `corepack enable && pnpm install`
- Build all packages: `pnpm run build`
- Lint: `pnpm run lint`
- Lint and auto-fix: `pnpm run lint:fix`
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

## Packages

This monorepo contains the following packages:

| path | package name | description |
| ---- | ----------- | ----------- |
| `/` | `@kurone-kito/pnpm-workspace-template` | Workspace root — linting and orchestration. |
| `/packages/cli` | `@kurone-kito/pwt-cli` | CLI application boilerplate. |
| `/packages/lib` | `@kurone-kito/pwt-lib` | Reusable library boilerplate. |
| `/packages/web-solid` | `@kurone-kito/pwt-web-solid` | Web application (SolidStart). |

Use workspace-scoped commands when targeting a specific package:
`pnpm -F '<package-name>' run <script>`

## Commit rules

This project follows
[Conventional Commits](https://www.conventionalcommits.org/).
A `.gitmessage` template is available at the repository root.
Write user-facing, lowercase subjects, keep them under 72 characters,
and split unrelated changes into separate atomic commits.

## Onboarding detection

When starting a session, check whether this repository is the base
template or a derived project:

- If the repository name is exactly `pnpm-workspace-template`, it is
  the base template — no action needed.
- If the name differs **and** this file still contains the phrase
  `pnpm monorepo workspace template`, the guidelines have not been
  customized yet.

In that case, **proactively propose an onboarding workflow** to
customize the project's documentation, tooling, and AI guidelines.
See the full onboarding checklist in
[.github/copilot-instructions.md](.github/copilot-instructions.md).

## Canonical reference

The full, Copilot-first project guidance lives in
[.github/copilot-instructions.md](.github/copilot-instructions.md).
When that file uses Copilot-specific workflow names, apply the intent
in Gemini CLI using its own interaction model rather than following
the product terms literally.
