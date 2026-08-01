# IDD Policy Configuration

This repository uses Issue-Driven Development (IDD) from
[`kurone-kito/idd-skill`](https://github.com/kurone-kito/idd-skill).
These policies were confirmed by the maintainer (`kurone-kito`) on
2026-07-14 and imported into this repository on 2026-08-01 (issue #49).
`.github/idd/config.json` is the machine-readable mirror of the same
decisions; keep both in sync in the same change.

## Merge Policy

**Policy**: `fully_autonomous_merge`

One trusted agent session may execute merge phase F3 after the normal
claim, freshness, CI, advisory, and review gates pass.

**Model-tier condition**: this policy presumes the loop is driven by a
**middle-tier-or-better** cloud-class model (see
[Model capability expectations](idd-workflow.md#model-capability-expectations)).
The lightweight/local tier must not run the autonomous merge phases —
if this repository's loop is ever operated by a lightweight local or
compact-cloud model, switch to `human_merge` or
`separate_merge_agent` for that session instead of relying on this
default.

## PR Review Policy

**Profile**: `copilot-advisory` (distributed default) — this
repository keeps the distributed GitHub Copilot advisory review
profile.

## Review-Thread Resolution Policy

**Policy**: `fast-agent-resolve` (distributed default)

## Critique-Loop Profile

**Profile**: distributed defaults from `docs/policy-constants.md` — no
repository override.

## Claim Timing

- **claim-stale-age**: 24 h (distributed default)
- **claim-heartbeat-interval**: 12 h (distributed default)

## CI Wait Policy

- **running timeout**: `PT30M` / 30 min (distributed default)
- **generation timeout**: `PT10M` / 10 min (distributed default)
- **rerun policy**: `rerun-once` (distributed default)

## Advisory-Convergence Scope

**Scope**: `advisoryWait.convergenceScope` = `all-prs` (distributed
default). Kept rather than switched to `idd-claimed`, so advisory
convergence applies to every PR, not only verified IDD-owned PRs — this
repository does not want to exempt non-IDD PRs from convergence.

## Credential Scope

**Worker credentials**: repository write access for issue/PR/branch
operations (least-privilege worker scope for this solo repository).

**Merge-capable credentials**: same as worker — this is a solo
repository under `fully_autonomous_merge`, so no separate merge-capable
credential tier is provisioned.

## Helper Runtime Profile

**Profile**: `package-manager` (pnpm)

The `@kurone-kito/idd-skill` helper dependency is **not published to
the npm registry**; its default dependency spec is a moving
`refs/heads/main` codeload tarball URL. This repository pins it instead
to a reviewed commit archive for reproducibility:

```text
https://codeload.github.com/kurone-kito/idd-skill/tar.gz/bc811500653a3bd504d34e4a08ad00a18eb72a9e
```

(idd-skill commit `bc81150`, `@kurone-kito/idd-skill@0.4.0`.) Bump this
pin deliberately (re-run
`idd-helper-bundle-manifest --profile package-manager --package-spec <new-pin>`
from a newer idd-skill clone) rather than letting it drift to `main`.

Under this profile, the `idd-*` `bin/` facade (invoked through the
`package.json` `idd:*` scripts) is the authoritative invocation
surface; instruction files that show `node scripts/<name>.mjs` are
written for the `vendored-node` profile and should be resolved to the
matching `idd-*` bin here instead of maintaining both surfaces.

## Issue-Author Approval Gate

- **Gate posture**: `enabled-by-default` (distributed default)
- **Opt-out state**: gate remains default-enabled;
  `skipIssueAuthorApprovalGate` is not set in
  `.github/idd/config.json`
- **`maintainer-approval-actors` policy**: `owners-and-maintainers-only`
  (recommended default) — only owners and collaborators with Maintain
  or Admin permission count as approval actors. Owner-authored issues
  are self-authorizing.
- **Approval signals**: distributed defaults (no custom ready label or
  freshness mode configured)
- **Missing-approval behavior**: explicit-target stop-before-claim +
  discovery approval-needed fallback bucket (distributed default)

## Issue-Authoring Companion

**Status**: `installed`

Canonical bundle at `skills/issue-authoring/`, mirrored byte-identical
into `.claude/skills/issue-authoring/` (Claude Code, and OpenCode via
its `.claude/skills/` compatibility) and `.github/skills/issue-authoring/`
(Copilot). idd-skill itself keeps only `skills/` + `.claude/skills/`;
the third `.github/skills/` mirror is this repository's own choice, so
this companion actually reaches the agent runtime (Copilot) that
reviews every PR in this repository.

- **`issueAuthoring.maxClarificationRounds`**: `3`

## IDD Labels

Distributed defaults: `roadmap`, `status:blocked-by-human`,
`status:needs-decision`, `status:authoring` — already created in this
repository before this import.

## Trusted Marker Actors

`kurone-kito` — the only trusted marker actor; matches
`trustedMarkerActors` in `.github/idd/config.json`.

## Claude Code Permission Baseline (`.claude/settings.json`)

**Decision**: adopted, using the **dogfood variant** (the same shape as
idd-skill's own repository-root `.claude/settings.json`, not the
conservative opt-in `idd-template/.claude/settings.json` counterpart).

The opt-in template counterpart withholds `gh pr merge` from its allow
list and denies `Bash(node scripts/idd-merge-execute.mjs*)` /
`Bash(node bin/idd-merge-execute.mjs*)`, so a freshly onboarded,
possibly `human_merge` repository is never handed an unattended merge
allowance by default. This repository already records
`mergePolicy: fully_autonomous_merge` (confirmed 2026-07-14, reaffirmed
above), so those two conservative edits do not apply here — this
repository's `.claude/settings.json` allows `gh pr merge*` and carries
no deny on the `idd-merge-execute` bin, exactly mirroring idd-skill's
own dogfood baseline. See
`docs/permissions.md#claude-code-permission-baseline` for the full
rationale, scope, and known flag/path-matching gotchas (including the
`gh api` DELETE-verb trap, which stays out of the allow list here too).

One deliberate divergence from upstream's dogfood file: this
repository's baseline drops the `Bash(node scripts/*)` /
`Bash(node bin/*)` allow entries. Those exist upstream because
idd-skill's own repository *is* the `vendored-node` source tree; under
this repository's `package-manager` profile the `idd-*` helpers run
through `pnpm exec`/`package.json` scripts instead, this repository has
no `bin/` directory at all, and its own `scripts/` holds only small
release utilities (`isPrerelease.mjs`, `createEntryStub.mjs`) — keeping
the wildcard would widen the attack surface (any newly added or
modified script under `scripts/` would run without a permission
prompt) with no corresponding IDD-helper benefit here.

Personal additions belong in `.claude/settings.local.json`, which
layers on top of the committed baseline.
