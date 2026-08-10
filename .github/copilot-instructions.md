# Guidelines for AI Agents

This repository is a pnpm-workspace monorepo that hosts the Node.js
tooling `@kurone-kito/builder-config` maintains and publishes:
`sea-builder` (a Single Executable App builder), `vite-lib-config` and
`typescript-config` (shared build/lint configuration packages), and
the `example-cli` / `example-lib` packages that exercise them end to
end. It is derived from the language-independent
[template](https://github.com/kurone-kito/template) repository via
[`pnpm-project-template`](https://github.com/kurone-kito/pnpm-project-template).

When contributing to this repository using AI agents, adhere to the
following guidelines to ensure high-quality contributions that align
with the project's standards and practices:

## Tooling priority and compatibility

Day-to-day implementation in this repository — including its
Issue-Driven Development (IDD) automation — is primarily carried out
with Claude Code. GitHub Copilot and CodeRabbit are also active as
automated pull-request reviewers. Keep this file as the canonical,
fully detailed guide; `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` exist
as lightweight compatibility entry points for Codex, Claude Code, and
Gemini CLI so each can receive the minimum project rules immediately
without depending on a redirect.

## Conversation

- The conversational language should match the user's language.
  For example, if the user speaks in Japanese, respond in Japanese.
- However, comments and documentation should be written in English unless
  there is a clear context otherwise.
- **Always** run `pnpm run lint:fix` after making any changes — no
  matter how small (including documentation typo fixes). Then verify
  with `pnpm run lint` before committing. This ensures consistent
  style even when the change itself seems trivial.
- If uncertainties, concerns, or other implementation issues arise while
  running in Agent mode, promptly switch to Plan mode and ask the user
  questions. In such cases, provide one or more recommended response
  options.
- Outside GitHub Copilot, interpret the `Agent mode` and `Plan mode`
  wording by intent: continue autonomously for low-risk work, but pause
  and ask a concise question when uncertainty or hidden risk makes the
  next step unsafe. When that pause is needed, provide one or more
  recommended response options.

## Boundaries

### Always do

- Run `pnpm run lint:fix` after every change, then verify with
  `pnpm run lint`
- Follow Conventional Commits for all commits
- Use LF line endings, 2-space indentation, and a final newline
- Keep commits atomic — one logical change per commit
- Write comments and documentation in English

### Ask first

- Adding or removing dependencies
- Changing the project architecture or directory structure
- Modifying CI/CD workflows (`.github/workflows/`)
- Altering shared configuration packages (`@kurone-kito/*-config`)
- Making changes that affect all workspace packages

### Never do

- Commit secrets, credentials, API keys, or tokens into source code
- Modify community documents (`CODE_OF_CONDUCT*`, `CONTRIBUTING*`)
  without explicit approval
- Disable or bypass linter rules without justification
- Accept AI-generated code without reviewing it for correctness
  and security
- Introduce breaking changes without a `BREAKING CHANGE` footer

## Commit rules

This project follows
[Conventional Commits](https://www.conventionalcommits.org/).
A `.gitmessage` template is available at the repository root for
guidance when writing commit messages.

### Format

```txt
<type>[optional scope]: <user-facing description>

<body: address purpose, context, and what changed>

[optional footer(s)]
```

### Subject line

- Use the format: `<type>[optional scope]: <description>`
- Write from the **user's perspective** — briefly state what this
  commit solves or improves for the end user or developer
- Write in **lowercase**, imperative mood (e.g., "add", not "added")
- Keep the subject line under **72 characters**
- Do **not** end with a period

### Types

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`,
`chore`, `ci`, `build`, `perf`

### Scopes

- Optional, in parentheses: `feat(ci):`, `fix(lint):`, `docs(readme):`
- Keep scopes **lowercase**, short, and consistent
- Use the directory or component name that best describes the area
  (e.g. a package name such as `sea-builder`)

### Body (line 3+)

The body should address three aspects:

- **Why** — the purpose or motivation behind the change
- **Context** — what was needed, the situation or constraint
- **What changed** — the concrete action taken

Prefer the **why → context → change** order when practical.
Write these as **natural prose** — weave the aspects into
coherent sentences rather than using labeled sections. Labeled
sections (`Why:` / `Context:` / `Change:`) are acceptable only
when explicit paragraph separation improves clarity.

Omit any aspect whose information **cannot be reliably inferred**.
If the subject line is self-explanatory, the body may be omitted
entirely. **Breaking changes must always include a body.**

Wrap body lines at **72 characters**.

### Breaking changes

- Append `!` after the type/scope: `feat!: remove deprecated endpoint`
- Add a `BREAKING CHANGE:` trailer in the footer with a detailed
  explanation of what breaks and migration steps

### Footers / trailers

- `Closes #<issue>` / `Refs #<issue>` — link to issues
- `Co-authored-by: Name <email>` — credit co-authors
- `BREAKING CHANGE: <description>` — detail the breaking change

### Atomic commits

Keep each commit as **small and focused** as possible:

- **One logical change per commit** — if the subject line needs "and",
  consider splitting
- **Separate refactoring** from behavior changes
- **Separate formatting/style** changes from logic changes
- **Separate dependency updates** from code changes
- When in doubt, prefer smaller commits that are easy to review,
  revert, and bisect

### Examples

#### Good — single-line (trivial change)

```txt
fix: correct typo in feature request template
```

#### Good — prose body

```txt
feat(ci): add concurrency settings to lint workflow

Parallel lint runs on the same branch waste resources and
cause race conditions in status checks. GitHub Actions
supports concurrency groups that automatically cancel
redundant runs, so add a concurrency group keyed on branch
name with cancel-in-progress enabled.

Refs #42
```

#### Good — breaking change

```txt
feat!: raise the minimum supported node.js version

The pinned Node.js LTS line reached end of life and the
next LTS raises the engines floor. All CI matrix rows and
downstream consumers must upgrade accordingly.

BREAKING CHANGE: drop support for the previous Node.js LTS
line. Users must upgrade to the new minimum version or later.
Closes #48
```

#### Bad — vague, developer-centric

```txt
fix: update code
```

#### Bad — too large / non-atomic

```txt
feat: add auth system and refactor database layer and update docs
```

## Coding Standards

- **Indentation**: 2 spaces (enforced by `.editorconfig`)
- **Line endings**: LF only (enforced by `.editorconfig` and
  `.gitattributes`)
- **Trailing whitespace**: trimmed (except in Markdown)
- **Final newline**: always present
- **File naming**: lowercase with hyphens (e.g., `feature-request.yml`)
  unless constrained by a platform convention (e.g., `CONTRIBUTING.md`)

## Development

### Install the dependencies

```sh
corepack enable
pnpm install
```

### Linting

```sh
pnpm run lint
pnpm run lint:fix # Lint and auto-fix
```

### Building

```sh
pnpm run build
```

### Testing

```sh
pnpm run test
```

`pnpm run test` runs both the TypeScript type-check (`test:ts`) and
the Vitest suite with coverage (`test:vitest`) across every workspace
package.

### Cleaning

```sh
pnpm run clean
```

## Monorepo guidance

This repository is a pnpm workspace (`packages/*`). When working in
it:

- **Scoped commands** — prefer `pnpm --filter <package>` over
  running commands at the root to save time and reduce noise
- **Package naming** — the workspace packages are
  `@kurone-kito/example-cli`, `@kurone-kito/example-lib`,
  `@kurone-kito/sea-builder`, `@kurone-kito/typescript-config`, and
  `@kurone-kito/vite-lib-config`; check the `name` field in each
  package's `package.json` to confirm the correct name before
  referencing it
- **Dependency boundaries** — respect workspace package boundaries;
  avoid circular dependencies between packages
- **Shared configuration** — `typescript-config` and
  `vite-lib-config` are consumed by every other workspace package;
  changes to them affect the whole monorepo and require the "ask
  first" step above
- **Publishing** — `pnpm -r publish` runs with
  `workspaceConcurrency: 1` (see `pnpm-workspace.yaml`) so that
  publish steps do not race; do not remove that setting

### Release checklist

- Before cutting a release, for every package that has `[Unreleased]`
  entries in its `packages/<name>/CHANGELOG.md`, insert a new
  `## [<version>] - <YYYY-MM-DD>` heading below `## [Unreleased]` and
  move those entries under it, in the same pre-release change that
  bumps `package.json` versions. Keep `## [Unreleased]` in place,
  empty, for the next round of entries — never rename or remove it. A
  package a release did not touch keeps no heading for that version —
  see the CHANGELOG Policy section in
  [docs/idd-policy.md](../docs/idd-policy.md#changelog-policy) for the
  full rule and its rationale.

## IDD Workflow

This project uses Issue-Driven Development (IDD) with parallel AI
agents. Start with [docs/idd-workflow.md](../docs/idd-workflow.md) for
the cross-agent entry path and phase routing.

Before starting IDD work, open
`.github/instructions/idd-overview-core.instructions.md`. Open the
routed phase file manually when the current step changes.
`idd-overview-core.instructions.md` sets `excludeAgent: "code-review"`
in its frontmatter — that is deliberate: it keeps the review agent out
of the IDD execution protocol files, while the rest of this
repository-wide Copilot guidance still applies during review.
Repository policy decisions (merge policy, review policy, helper
runtime, etc.) are recorded in
[docs/idd-policy.md](../docs/idd-policy.md).

## Guardrails

- **Do not** modify community documents (CODE_OF_CONDUCT, CONTRIBUTING)
  without explicit approval

## Security

These rules follow the
[OpenSSF Security-Focused Guide for AI Code Assistant Instructions](https://best.openssf.org/Security-Focused-Guide-for-AI-Code-Assistant-Instructions.html):

- **No secrets in code** — store credentials in environment variables
  or a secrets manager; never hard-code them
- **Treat AI output as untrusted** — review all generated code for
  correctness, security vulnerabilities, and adherence to project
  standards before committing
- **Validate inputs** — ensure all external data is validated and
  sanitized before use
- **Verify dependencies** — confirm that any recommended packages are
  reputable, actively maintained, and free of known vulnerabilities
- **Recursive review** — when generating security-sensitive code, ask
  the AI to review its own output and suggest improvements before
  accepting
