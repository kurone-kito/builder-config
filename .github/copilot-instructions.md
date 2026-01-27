# Guidelines for AI Agents

This project is a pnpm monorepo workspace template containing three
sample packages: a CLI application, a library, and a web application.
When contributing to this repository using AI agents, adhere to the
following guidelines to ensure high-quality contributions that align
with the project's standards and practices:

## Tooling priority and compatibility

This repository is intentionally optimized for GitHub Copilot CLI and
VS Code Copilot Chat because they are the primary tools used for
day-to-day work and benchmarking.

`AGENTS.md` and `CLAUDE.md` exist as lightweight compatibility entry
points for Codex and Claude Code. Keep this file as the canonical,
fully detailed guide unless benchmark results justify a more neutral
layout.

Per-package conventions are provided in `.github/instructions/` as
scoped instruction files. These are automatically loaded by VS Code
Copilot when working in the corresponding package directory.

## Conversation

- The conversational language should match the user's language.
  For example, if the user speaks in Japanese, respond in Japanese.
- However, comments and documentation should be written in English
  unless there is a clear context otherwise.
- **Always** run `pnpm run lint:fix` after making any changes — no
  matter how small (including documentation typo fixes). Then verify
  with `pnpm run lint` before committing. This ensures consistent
  style even when the change itself seems trivial.
- If uncertainties, concerns, or other implementation issues arise
  while running in Agent mode, promptly switch to Plan mode and ask
  the user questions. In such cases, provide one or more recommended
  response options.
- Outside GitHub Copilot, interpret the `Agent mode` and `Plan mode`
  wording by intent: continue autonomously for low-risk work, but
  pause and ask a concise question when uncertainty or hidden risk
  makes the next step unsafe. When that pause is needed, provide one
  or more recommended response options.

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

- Optional, in parentheses: `feat(ci):`, `fix(lint):`,
  `docs(readme):`
- Keep scopes **lowercase**, short, and consistent
- Use the directory or component name that best describes the area

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

- Append `!` after the type/scope:
  `feat!: remove deprecated endpoint`
- Add a `BREAKING CHANGE:` trailer in the footer with a detailed
  explanation of what breaks and migration steps

### Footers / trailers

- `Closes #<issue>` / `Refs #<issue>` — link to issues
- `Co-authored-by: Name <email>` — credit co-authors
- `BREAKING CHANGE: <description>` — detail the breaking change

### Atomic commits

Keep each commit as **small and focused** as possible:

- **One logical change per commit** — if the subject line needs
  "and", consider splitting
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
feat!: require node 20 as minimum version

Node 18 reaches end-of-life and lacks native fetch support
used by the new HTTP client. All production environments
have already been upgraded to node 20+, so update the
engines field and CI matrix to require node >= 20.

BREAKING CHANGE: drop support for node 16 and 18. Users
must upgrade to node 20 or later.
Closes #108
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
- **File naming**: lowercase with hyphens
  (e.g., `feature-request.yml`) unless constrained by a platform
  convention (e.g., `CONTRIBUTING.md`)

## Packages

| path                  | package name                           | description                                        |
| --------------------- | -------------------------------------- | -------------------------------------------------- |
| `/`                   | `@kurone-kito/pnpm-workspace-template` | Manage the monorepo workspace and linting.         |
| `/packages/cli`       | `@kurone-kito/pwt-cli`                 | A boilerplate for CLI applications.                |
| `/packages/lib`       | `@kurone-kito/pwt-lib`                 | A boilerplate for libraries.                       |
| `/packages/web-solid` | `@kurone-kito/pwt-web-solid`           | A boilerplate for web applications using Solid.js. |

### Cross-package dependencies

- `@kurone-kito/pwt-lib` is the foundational library consumed by
  both CLI and Web packages via `workspace:^` references.
- Changes to `pwt-lib` exports may require updates in consuming
  packages.
- Run `pnpm run build` at the root to build all packages in
  dependency order.

### Scoped instructions

Per-package conventions are provided in
`.github/instructions/*.instructions.md`. These files are
automatically loaded by VS Code Copilot when working in the
corresponding package directory.

## Development

### Install the dependencies

```sh
corepack enable
pnpm install
```

### Building

```sh
pnpm run build

# Watch mode for all packages
pnpm run dev

# Build a specific package
pnpm -F '@kurone-kito/pwt-lib' run build

# Build Single Executable Applications (CLI)
pnpm run build:sea
```

### Linting

```sh
pnpm run lint
pnpm run lint:fix # Lint and auto-fix
```

### Testing

Run `pnpm run build` before executing the test commands.

```sh
pnpm run test        # Run unit tests
pnpm run test:e2e    # Run end-to-end tests (web-solid)
pnpm run test:ts     # TypeScript type checking
```

### Cleaning

```sh
pnpm run clean
```

## Guardrails

- **Do not** modify community documents (CODE_OF_CONDUCT,
  CONTRIBUTING) without explicit approval

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

## Onboarding

This project is a pnpm monorepo workspace template, a derivative of
[kurone-kito/pnpm-project-template](https://github.com/kurone-kito/pnpm-project-template).
It demonstrates how to structure a multi-package workspace with
shared tooling and conventions.

For non-monorepo projects, use
[pnpm-project-template](https://github.com/kurone-kito/pnpm-project-template)
instead.

### Derived-repository detection

When an AI agent starts a session, it should determine whether this
repository is the **base template** or a **derived project**:

1. **Check the repository name** — inspect the git remote URL
   (e.g., `git remote get-url origin`), the working-directory name,
   or any GitHub API context available to the agent. If the
   repository name is exactly `pnpm-workspace-template`, treat it as
   the base template. Any other name indicates a derived project.
2. **Check for generic content** — look for the sentinel phrase
   `pnpm monorepo workspace template` in this file or in the
   repository's AI instruction files. Its presence means the
   guidelines have **not yet been customized**.

If both conditions are met — the repository is derived **and** the
guidelines are still generic — the agent should **proactively
propose an onboarding workflow** before proceeding with the user's
request. The proposal should be conversational, brief, and
non-blocking (the user may decline and continue normally).

### Onboarding proposal

When proposing onboarding, suggest customizing the following areas
in a single plan:

1. **Project description** — update `README.md` and the opening
   lines of AI instruction files to reflect the project's purpose
2. **Package configuration** — update package names, scopes, and
   descriptions in every `package.json`
3. **Framework / toolchain** — identify the primary framework;
   add relevant build tooling and type definitions
4. **Dependency management** — configure workspace structure and
   lock-file conventions as needed
5. **Testing strategy** — define the test runner, coverage targets,
   and test-file conventions
6. **CI/CD workflows** — adjust `.github/workflows/` to match the
   project's build, test, and deploy pipeline
7. **AI guideline specialization** — rewrite this file,
   `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and scoped instructions
   in `.github/instructions/` to include project-specific rules,
   coding patterns, and architecture notes
8. **License review** — confirm or replace the MIT license if the
   project requires a different one

Present these items as a checklist proposal (e.g., in Plan mode for
Copilot, or as a numbered list for other agents). Let the user
select which items to tackle and in what order.
