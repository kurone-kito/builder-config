# AI tooling strategy

This repository currently prioritizes GitHub Copilot because it
provides the best latency and workflow fit for day-to-day vibe coding
in this monorepo template.

## Canonical guidance

- [.github/copilot-instructions.md](../.github/copilot-instructions.md)
  is the canonical, fully detailed AI guide. Keep it complete enough
  for GitHub Copilot CLI and VS Code Copilot Chat.
- [.github/instructions/](../.github/instructions/) contains
  per-package scoped instruction files that VS Code Copilot loads
  automatically when working in the corresponding package directory.
- [AGENTS.md](../AGENTS.md) is a Codex compatibility entry point. It
  must stay self-contained for the rules that Codex needs immediately,
  then point to the canonical Copilot guide for the remaining detail.
- [CLAUDE.md](../CLAUDE.md) is a Claude Code compatibility entry point
  with the same role.

## Change policy

- Prefer preserving existing Copilot behavior over abstracting too
  early.
- Duplicate only the minimum guidance needed for non-Copilot agents to
  act safely and predictably.
- Extract shared text into a neutral document only after benchmarks
  show that the Copilot-first workflow does not regress.
- When a rule uses a Copilot-specific feature name, document the
  underlying intent so other agents can map it to their own interaction
  model.

## Monorepo-specific strategy

- Scoped instruction files (`.github/instructions/*.instructions.md`)
  provide per-package context without bloating the canonical guide.
- When adding a new package to the workspace, create a corresponding
  scoped instruction file documenting its tech stack, conventions,
  and build/test commands.
- Ensure scoped files do not contradict the canonical guide — they
  should supplement, not override.

## Maintenance notes

- Treat this file as a human-facing strategy note, not as the primary
  instruction file for any agent.
- When updating AI guidance, review all related files together:
  - `.github/copilot-instructions.md`
  - `.github/instructions/*.instructions.md`
  - `AGENTS.md`
  - `CLAUDE.md`
  - `README.md` (AI guidance section)
