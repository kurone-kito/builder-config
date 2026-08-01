# AI tooling strategy

This repository's day-to-day implementation work — including its
Issue-Driven Development (IDD) automation adopted from
[`kurone-kito/idd-skill`](https://github.com/kurone-kito/idd-skill) —
is primarily carried out with Claude Code. GitHub Copilot and
CodeRabbit are also active as automated pull-request reviewers.

## Canonical guidance

- [.github/copilot-instructions.md](../.github/copilot-instructions.md)
  is the canonical, fully detailed AI guide. Keep it complete enough
  for any agent that lands on it directly.
- [AGENTS.md](../AGENTS.md) is a Codex compatibility entry point. It
  must stay self-contained for the rules that Codex needs immediately,
  then point to the canonical guide for the remaining detail.
- [CLAUDE.md](../CLAUDE.md) is a Claude Code compatibility entry point
  with the same role.
- [GEMINI.md](../GEMINI.md) is a Gemini CLI compatibility entry point
  with the same role.

## Change policy

- Prefer preserving existing agent behavior over abstracting too
  early.
- Duplicate only the minimum guidance needed for each compatibility
  entry point to act safely and predictably.
- Extract shared text into a neutral document only after the current
  duplication becomes a maintenance burden.
- When a rule uses a tool-specific feature name, document the
  underlying intent so other agents can map it to their own
  interaction model.

## Maintenance notes

- Treat this file as a human-facing strategy note, not as the primary
  instruction file for any agent.
- When updating AI guidance, review `README.md`,
  `.github/copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`, and
  `GEMINI.md` together.
