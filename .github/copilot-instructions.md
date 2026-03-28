# Guidelines for AI Agents

This project provides shared build tooling and configuration
packages for the author's Node.js projects. It publishes reusable
TypeScript, Vite, and SEA-builder configurations so that downstream
repositories can adopt a consistent build pipeline without
duplicating setup. It is derived from
[kurone-kito/pnpm-project-template](https://github.com/kurone-kito/pnpm-project-template)
(cumulative-updates branch).

## Tooling priority and compatibility

This repository is optimized for **GitHub Copilot CLI** and
**VS Code Copilot Chat** as the primary AI tools.
**Codex CLI** is used as a secondary tool.

| File | Purpose |
| ---- | ------- |
| `.github/copilot-instructions.md` | Canonical, fully detailed guide (this file) |
| `AGENTS.md` | Lightweight entry point for Codex |
| `CLAUDE.md` | Lightweight entry point for Claude Code |
| `GEMINI.md` | Lightweight entry point for Gemini CLI |
| `.github/instructions/*.instructions.md` | Per-package scoped instructions for VS Code Copilot |

## Commands

Run these at the workspace root. Prefer workspace-scoped commands
when targeting a single package:
`pnpm -F '<package-name>' run <script>`

```sh
corepack enable && pnpm install   # Install dependencies
pnpm run build                    # Build all packages (dependency order)
pnpm run dev                      # Watch mode for all packages
pnpm run lint:fix                 # Lint and auto-fix
pnpm run lint                     # Lint (verify only)
pnpm run test                     # Run all tests (builds first)
pnpm run test:vitest              # Unit tests with coverage
pnpm run test:ts                  # TypeScript type checking
pnpm run build:sea                # Build SEA binaries (CLI)
pnpm run clean                    # Remove build artifacts
```

## Conversation

- Match the conversational language to the user's language.
  For example, if the user speaks in Japanese, respond in Japanese.
- Write comments and documentation in **English** unless there is a
  clear context otherwise.
- **Always** run `pnpm run lint:fix` after making any changes — no
  matter how small (including documentation typo fixes). Then verify
  with `pnpm run lint` before committing.
- If uncertainties, concerns, or other implementation issues arise
  while running in Agent mode, promptly switch to Plan mode and ask
  the user questions. In such cases, provide one or more recommended
  response options.
- Outside GitHub Copilot, interpret the `Agent mode` and `Plan mode`
  wording by intent: continue autonomously for low-risk work, but
  pause and ask a concise question when uncertainty or hidden risk
  makes the next step unsafe.

## Boundaries

### Always do

- Run `pnpm run lint:fix` after every change, then verify with
  `pnpm run lint`
- Follow Conventional Commits for all commits
- Use LF line endings, 2-space indentation, and a final newline
- Keep commits atomic — one logical change per commit
- Write comments and documentation in English
- Run `pnpm run build` before testing (`pretest` does this
  automatically, but be aware of the dependency)

### Ask first

- Adding or removing dependencies
- Changing the project architecture or directory structure
- Modifying CI/CD workflows (`.github/workflows/`)
- Altering shared configuration packages (`@kurone-kito/*-config`)
- Making changes that affect all workspace packages
- Changing public API surface of published packages
  (`sea-builder`, `typescript-config`, `vite-lib-config`)

### Never do

- Commit secrets, credentials, API keys, or tokens into source code
- Modify community documents (`CODE_OF_CONDUCT*`, `CONTRIBUTING*`)
  without explicit approval
- Disable or bypass linter rules without justification
- Accept AI-generated code without reviewing it for correctness
  and security
- Introduce breaking changes without a `BREAKING CHANGE` footer
- Remove or weaken TypeScript strict-mode options in
  `typescript-config`

## Architecture

```txt
builder-config (workspace root)
├── packages/
│   ├── typescript-config  ← Shared tsconfig (published)
│   ├── vite-lib-config    ← Vite/Vitest config factory (published)
│   ├── sea-builder        ← Cross-platform SEA builder CLI (published)
│   ├── example-lib        ← Demo library (private)
│   └── example-cli        ← Demo CLI using SEA builder (private)
├── biome.jsonc            ← extends @kurone-kito/biome-config
├── vitest.config.mts      ← workspace-level Vitest config
└── tsconfig.json          ← project references to all packages
```

### Package overview

| Package | Published | Role |
| ------- | --------- | ---- |
| `@kurone-kito/typescript-config` | ✅ | Strict TypeScript settings (ES2023, nodenext, composite) |
| `@kurone-kito/vite-lib-config` | ✅ | `viteConfig()` and `vitestConfig()` factory functions for library and CLI builds |
| `@kurone-kito/sea-builder` | ✅ | CLI tool that builds Node.js apps into Single Executable Applications across 6 platforms |
| `@kurone-kito/example-lib` | ❌ | Minimal library to validate the config packages |
| `@kurone-kito/example-cli` | ❌ | Minimal CLI to validate the SEA builder pipeline |

### Dependency flow

```txt
typescript-config ──► vite-lib-config ──► example-lib
                                     └──► example-cli ◄── sea-builder
                                     └──► sea-builder
```

All packages reference `typescript-config` and `vite-lib-config`
via `workspace:^`. The `example-cli` depends on `example-lib` for
its runtime output and on `sea-builder` for SEA binary generation.

### External shared configurations

This workspace consumes sibling config packages published
separately. Do **not** modify their behavior from within this repo:

- `@kurone-kito/biome-config` — Biome linter/formatter rules
- `@kurone-kito/commitlint-config` — Conventional Commits enforcement
- `@kurone-kito/cspell-config` — Spell-check dictionaries

## Tech stack

- **Runtime**: Node.js ^20.18 || ^22 || >=24
- **Package manager**: pnpm (corepack-managed)
- **Language**: TypeScript ~6.0 (strict mode, `verbatimModuleSyntax`,
  `erasableSyntaxOnly`)
- **Bundler**: Vite 8 (library mode for ES modules, CJS for SEA)
- **Test runner**: Vitest 4 with `@vitest/coverage-v8`
- **Linter/formatter**: Biome 2
- **Spell checker**: cspell
- **Markdown linter**: markdownlint-cli2
- **Commit linter**: commitlint (Conventional Commits)
- **Git hooks**: Husky

## Coding standards

- **Indentation**: 2 spaces (enforced by `.editorconfig`)
- **Line endings**: LF only (enforced by `.editorconfig` and
  `.gitattributes`)
- **Trailing whitespace**: trimmed (except in Markdown)
- **Final newline**: always present
- **File naming**: lowercase with hyphens
  (e.g., `feature-request.yml`) unless constrained by a platform
  convention (e.g., `CONTRIBUTING.md`)
- **Module style**: ES modules (`.mts` extension) with
  `verbatimModuleSyntax` — always use `import type` for type-only
  imports

### Code patterns

```typescript
// ✅ Good — type-only import, explicit return type, descriptive name
import type { UserConfig } from 'vite';

export const createLibConfig = (entry: string): UserConfig => ({
  build: { lib: { entry, formats: ['es'] } },
});
```

```typescript
// ❌ Bad — missing type-only import, implicit return, vague name
import { UserConfig } from 'vite';

export const config = (e) => ({
  build: { lib: { entry: e, formats: ['es'] } },
});
```

### Anti-patterns to avoid

- Do **not** use `require()` or `.js`/`.ts` extensions — this is
  an ESM-only project using `.mts`
- Do **not** add `any` type annotations — the strict TypeScript
  config enforces `noImplicitAny`
- Do **not** use barrel re-exports without `export type` for
  type-only symbols (`verbatimModuleSyntax` will error)
- Do **not** skip `readonly` modifiers where possible — prefer
  immutable data

## Testing strategy

- **Framework**: Vitest 4 with v8 coverage provider
- **Test location**: co-located with source as `*.spec.mts` files
  (e.g., `src/index.spec.mts`)
- **Test naming**: use descriptive names that explain expected
  behavior (e.g., `it('returns the default message')`)
- **Coverage**: v8 provider; exclusions configured in
  `vitest.config.mts` (dotfiles, config files, `coverage/`, `dist/`)
- **Build-before-test**: `pnpm run test` triggers `pretest` which
  runs `pnpm run build` automatically
- **Type checking**: `pnpm run test:ts` runs `tsc` via each
  package's own `test:ts` script

## Commit rules

This project follows
[Conventional Commits](https://www.conventionalcommits.org/).
A `.gitmessage` template is available at the repository root.

### Format

```txt
<type>[optional scope]: <user-facing description>

<body: address purpose, context, and what changed>

[optional footer(s)]
```

### Subject line

- Write from the **user's perspective** — briefly state what this
  commit solves or improves
- Write in **lowercase**, imperative mood (e.g., "add", not "added")
- Keep under **72 characters**; do **not** end with a period

### Types

`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`,
`build`, `perf`

### Scopes

Use the package directory name or component:
`feat(sea-builder):`, `fix(vite-lib-config):`, `docs(readme):`,
`chore(root):`, `ci(workflows):`

### Body

Address **why → context → what changed** as natural prose.
Omit the body when the subject line is self-explanatory.
**Breaking changes must always include a body.**
Wrap at **72 characters**.

### Breaking changes

- Append `!` after the type/scope:
  `feat!: remove deprecated endpoint`
- Add a `BREAKING CHANGE:` trailer with migration steps

### Atomic commits

- **One logical change per commit**
- **Separate refactoring** from behavior changes
- **Separate formatting** from logic changes
- **Separate dependency updates** from code changes

### Examples

```txt
fix: correct typo in feature request template
```

```txt
feat(vite-lib-config): add target option to specify build targets

Downstream projects need to override the default ES2023 + Node 20
build target for newer runtime environments. The viteConfig
factory now accepts an optional target array that is forwarded to
the Vite build configuration.

Refs #42
```

```txt
feat!: require node 20 as minimum version

Node 18 reaches end-of-life and lacks native fetch support.
Update the engines field and CI matrix to require node >= 20.

BREAKING CHANGE: drop support for node 16 and 18. Users must
upgrade to node 20 or later.
Closes #108
```

## Self-review checklist

Before considering a task complete, verify:

1. `pnpm run lint:fix` passes with no remaining errors
2. `pnpm run lint` confirms a clean state
3. `pnpm run build` succeeds for all affected packages
4. `pnpm run test:vitest` passes with no regressions
5. `pnpm run test:ts` shows no type errors
6. Public API changes are documented and backward-compatible
   (or marked as breaking)
7. Commit messages follow Conventional Commits format

## Security

These rules follow the
[OpenSSF Security-Focused Guide for AI Code Assistant Instructions](https://best.openssf.org/Security-Focused-Guide-for-AI-Code-Assistant-Instructions.html):

- **No secrets in code** — store credentials in environment
  variables or a secrets manager; never hard-code them
- **Treat AI output as untrusted** — review all generated code for
  correctness, security vulnerabilities, and adherence to project
  standards before committing
- **Validate inputs** — ensure all external data is validated and
  sanitized before use
- **Verify dependencies** — confirm that any recommended packages
  are reputable, actively maintained, and free of known
  vulnerabilities
- **Recursive review** — when generating security-sensitive code,
  ask the AI to review its own output and suggest improvements
  before accepting

## Guardrails

- Do **not** modify community documents (`CODE_OF_CONDUCT*`,
  `CONTRIBUTING*`) without explicit approval
- Do **not** weaken strict TypeScript options in
  `packages/typescript-config/tsconfig.json`
- Do **not** change Biome rules here — they are managed in the
  external `@kurone-kito/biome-config` package
