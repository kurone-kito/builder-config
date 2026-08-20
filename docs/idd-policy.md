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
repository does not want to exempt non-IDD PRs from convergence, other
than the narrow `exemptBotAuthoredPrs` carve-out below (a genuinely
`Bot`-typed author with no claim history, such as Dependabot — not a
blanket non-IDD-PR exemption).

## Advisory-Bot Policy

- **`advisoryWait.primaryBotLogin`**: `copilot` — this repository's
  `reviewPolicy` is `copilot-advisory`, so the advisory-wait gate's
  primary signal is GitHub Copilot's PR-review bot. `gh pr edit
  --add-reviewer`/`--remove-reviewer` resolve this login via GraphQL
  when requesting or removing a review; it matches idd-skill's own
  distributed default (explicit here for self-documentation rather
  than left implicit). It is deliberately
  **not** `copilot-pull-request-reviewer[bot]` — the
  distinct REST identity that appears as the review author in
  `gh api repos/{owner}/{repo}/pulls/{n}/reviews` and as the entry in
  `advisoryBotLogins` below. idd-skill resolves both forms
  automatically for the default Copilot bot (`EXACT_COPILOT_REVIEWER_LOGINS`
  in `protocol-helpers.mts`) only when `primaryBotLogin` is left at (or
  set to) `copilot`; setting it to the REST form instead would leave
  `--add-reviewer`/`--remove-reviewer` targeting an identity `gh` cannot
  resolve via GraphQL.
- **`advisoryWait.secondaryBotLogin`**: left unset. CodeRabbit was
  evaluated (its bot login is `coderabbitai[bot]`, confirmed via a live
  `gh api` timeline-event read — `sender.login` + `type: Bot`,
  distinguishing it from the separate `coderabbitai` `Organization`
  actor) but is **not requestable** the way this field requires: it
  runs as an installed GitHub App with no user-resolvable login, so
  `gh pr edit --add-reviewer "@coderabbitai[bot]"` fails outright
  (`Could not resolve user`) and the REST `requested_reviewers`
  fallback silently no-ops (both verified empirically against a live
  PR in this repository) — neither path posts the `review_requested`
  timeline event the once-per-HEAD guard needs. Configuring it anyway
  would leave `secondaryRequestNeeded` permanently true, causing
  repeated failed/no-op requests during primary-bot-stall recovery. Per
  the schema, omitting this field disables the non-gating secondary
  supplement entirely — CodeRabbit still contributes as ordinary
  advisory input via its own automatic per-push reviews, just not
  through this on-demand request path.
- **`advisoryBotLogins`**: `["copilot-pull-request-reviewer[bot]",
  "coderabbitai[bot]", "chatgpt-codex-connector[bot]"]` — the REST
  review-author identities these bots' comments/reviews actually carry
  (a separate concern from requestability above), including
  `chatgpt-codex-connector[bot]`, a third review bot first observed on
  PR #99 (issue #94) that was not previously configured anywhere.
  Listing all three here lets their post-disposition acknowledgement
  comments classify as structurally ack-only going forward instead of
  counting as fresh review activity.
- **`advisoryWait.exemptBotAuthoredPrs`**: `true` (opt-in, non-default)
  — this repository has a long history of Dependabot-authored PRs (see
  PR #28 through #86 among others) that never carry an IDD claim.
  Enabled so those PRs are classified `not_applicable` under
  `convergenceScope: all-prs` instead of being forced through the
  advisory-convergence gate meant for claimed IDD work.

## External CI-Check Trust

**`ciGate.trustSourcePinnedRequiredChecks`**: `true`, enabled.
`idd-advisory-convergence` is registered as a required status check
via a repository Ruleset (`gh api
repos/kurone-kito/builder-config/rules/branches/main`; the maintainer
action tracked by #51, which remains open pending its own remaining
acceptance criteria), and the resulting entry is source-pinned to a
specific reporting App (`integration_id: 15368`, GitHub Actions)
rather than a bare check-name match. Confirmed via a live PR (#117)
that the pinned integration correctly resolves to this repository's
own `idd-advisory-convergence.yml` workflow, so trusting it is safe.

**Known, accepted limitation**: `integration_id`-pinning verifies only
that the check was reported *by GitHub Actions*, not that the specific
workflow content is immutable — a PR can edit
`.github/workflows/idd-advisory-convergence.yml` on its own branch to
make the job trivially succeed while keeping the same check name and
`integration_id`, since the Ruleset checkout doesn't pin the workflow
file to a specific ref/SHA. Accepted rather than mitigated (e.g. by
pinning the workflow's own ref) because it introduces no new attack
surface for this specific repository: under `fully_autonomous_merge`,
anyone who can open a PR already has direct push access to `main`, so
a "forged check" actor is already a fully-trusted actor by this
repository's own merge policy. Revisit if this repository ever accepts
external contributions from untrusted authors.

**`ciGate.trustEmptyProtectionReads`**: `true`, enabled (2026-08-12).
This repository enforces its merge gate through a Ruleset only
(`main`, id `20674407`) and has no classic branch-protection record —
`gh api repos/kurone-kito/builder-config/branches/main/protection`
genuinely returns `404 Branch not protected`, not a masked `403`.
Confirmed before enabling: the automation token carries the `repo`
scope and resolves as an `admin` collaborator
(`gh api repos/kurone-kito/builder-config/collaborators/kurone-kito/permission`),
and the same token's Ruleset reads already succeed and correctly
resolve `idd-advisory-convergence` as the sole required check — so the
`404` cannot be this token lacking read access; it is a genuine "not
configured" result. Without this flag, the required-check-discovery
fail-closed default (`idd-ci.instructions.md`'s Required-check
discovery step 4) treats every classic-protection `404` as unreadable
and holds at F2/F3 regardless of Ruleset state, which blocked the
merge of issue `#124` before this flag was set. Revisit if this
repository ever adds classic branch protection alongside its Ruleset,
or if the automation token's scope is ever narrowed below `repo`.

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
https://codeload.github.com/kurone-kito/idd-skill/tar.gz/f51a8bb73a47452eff5799e8a27251b660ba4ae0
```

(idd-skill commit `f51a8bb7`, tagged `v0.7.0` on 2026-08-20;
`@kurone-kito/idd-skill@0.7.0`.) Bump this pin deliberately (re-run
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
no `bin/` directory at all, and its own `scripts/` holds only narrowly
scoped repo-local utilities (the release stub `createEntryStub.mjs` and
the CHANGELOG-policy lint check `check-changelog-policy.mjs`, added by
issue #160) — keeping the wildcard would widen the attack surface (any
newly added or modified script under `scripts/` would run without a
permission prompt) with no corresponding IDD-helper benefit here.

Personal additions belong in `.claude/settings.local.json`, which
layers on top of the committed baseline.

## IDD Enforcement Gates (issue #50)

The maintainer opted in (2026-07-14) to all three optional IDD
enforcement surfaces on top of the core import: the `idd-doctor` CI
health gate, the `idd-advisory-convergence` workflow, and the local
worktree guard.

### `idd-doctor` CI health gate

`.github/workflows/idd-doctor.yml` runs `pnpm exec idd-doctor` on every
pull request (checked out at a detached `github.sha`, which keeps the
worktree-guard check inert in CI — see below). It is **not** a required
status check; registering it as a required check is maintainer-only
work tracked in issue 51. It uses `idd-doctor`'s full 14-day default
cleanup-backlog window rather than narrowing it: measured directly on
this PR, the entire `Run idd-doctor` step (14-day scan included)
completed in under a second, so there is no timeout risk to trade
coverage against here.

The checkout step passes `fetch-depth: 0` (full history and tags): the
default shallow `fetch-depth: 1` hides tag refs, which silently skips
`idd-doctor`'s release-tag-drift check (`git describe --tags` fails and
the check returns with no warning, rather than erroring) — confirmed
by tracing `checkReleaseTagDrift` in the pinned `idd-skill` source. The
job also carries a `concurrency:` block (`cancel-in-progress: true`,
grouped by `${{ github.workflow }}-${{ github.ref }}`), matching
`idd-advisory-convergence.yml`'s own pattern, so a rapid string of
pushes to the same PR does not queue redundant runs.

`idd-doctor`'s post-merge cleanup-backlog scan already scopes itself to
IDD-branch merged PRs only (`idd-skill` upstream issue #1829), so a
routine Dependabot merge never counts toward the backlog total. This
scoping lives inside the vendored `@kurone-kito/idd-skill` package
(pinned to `v0.6.0` by issue #92) — it took effect automatically when
the pin was bumped, with no workflow-file or config change needed here.

The job's `permissions:` grants `issues: read` and `pull-requests: read`
alongside `contents: read`, and its `gh`-calling step sets
`GH_TOKEN: ${{ github.token }}`. Without both, `gh` has no credential
at all inside the job and every GitHub-API-backed check (cleanup
backlog, branch protection, autopilot-suitability) silently degrades
to one `github checks skipped: gh repo view unavailable` warning
instead of actually running — confirmed empirically by reproducing the
missing-token case locally. `idd-doctor` never escalates a missing or
insufficiently-scoped `gh` call to an error by default (only
`--require-github`/`--strict` would), so the branch-protection check
still degrades gracefully to a warning here: reading branch protection
settings needs `administration: read`, a materially more sensitive
scope than this gate's diagnostic purpose warrants, so it is
deliberately not granted.

### `idd-advisory-convergence` workflow

`.github/workflows/idd-advisory-convergence.yml` mirrors
`idd-template/.github/workflows/idd-advisory-convergence.yml`, adjusted
to this repository's `package-manager` helper profile
(`pnpm exec idd-advisory-convergence --pr "$PR_NUMBER" --assert`) and
its own SHA-pinned action conventions (matching `push-feature.yml`/
`common-release.yml`, per issue #55). It checks out `ref: main`
(trusted code), not the PR head, for every trigger including
`workflow_dispatch`. Registering it as a **required** status check is
maintainer-only work tracked in #51, not part of this issue.

**Trigger split (issue #163, matching `kurone-kito/idd-skill#2136`,
shipped in `v0.7.0`)**: this workflow no longer triggers on
`pull_request_review_comment`. That trigger now lives on a separate,
non-required companion workflow,
`.github/workflows/idd-advisory-convergence-comment.yml`, with its own
job id, workflow `name:`, and concurrency group, so an ordinary human
review-thread reply can no longer create or cancel this required
check's rollup for the PR HEAD. The companion classifies the
triggering comment and only reruns this workflow's existing run via
`idd-rerun-advisory-convergence --apply` when the comment is
IDD-originated; it never asserts `ready` itself. This workflow's CI
runner is also overridable now, via a `runner` `workflow_dispatch`
input defaulting to `ubuntu-slim` (falling back to the `CI_RUNNER_LABEL`
repository variable), replacing the previously hardcoded
`runs-on: ubuntu-latest` — adopted from
`idd-template/.github/workflows/idd-advisory-convergence.yml`'s
documented precedence rather than from `idd-skill`'s own dogfooded
root copy, which hardcodes `ubuntu-slim` with no override input at
all. This repository's copy is therefore a deliberate hybrid of the
two upstream shapes (the split from the dogfooded copy, the runner
override from the template copy), not a byte-for-byte mirror of
either.

The job intentionally carries no `name:` override, unlike this
repository's other jobs — its id, `idd-advisory-convergence`, is also
the check-run name the `idd-rerun-advisory-convergence` helper and the
external-check-waiver mechanism both hardcode as an exact-string match
(`DEFAULT_ADVISORY_CONVERGENCE_CHECK_SELECTOR` /
`RERUN_PLAN_CHECK_NAME` in idd-skill). A friendlier display name here
would silently break both: they'd query GitHub's check-runs API for a
check named exactly `idd-advisory-convergence` and find nothing —
confirmed empirically on this PR after the job briefly carried a
`name:` override.

**Waiver re-trigger procedure**: posting a maintainer waiver comment
does **not** by itself turn this check green — a PR conversation
comment fires GitHub's `issue_comment` event, which this workflow does
not listen for (only `pull_request` and `pull_request_review`, since
issue #163), and a completed run's conclusion never changes on its
own. After posting a waiver, also trigger a new
run: a push, a fresh Copilot review, the Actions UI "Re-run jobs"
button on the *existing* PR-linked run for the *current HEAD SHA*, or
`gh run rerun <run-id>` on that same run. An IDD-originated
review-thread comment refreshes that same HEAD run via the companion
`idd-advisory-convergence-comment.yml` workflow instead — an ordinary
human waiver-adjacent reply (e.g. "waived, see above") does not, by
design. **`workflow_dispatch` does
NOT reliably do this**: a dispatched run has no `pull_request` context
of its own, so GitHub associates it with the dispatch ref rather than
the PR's HEAD SHA, and the resulting run's conclusion can be invisible
to the PR's required-check rollup.

**Policy-engine model (v0.5.0/v0.6.0)**: the workflow file itself is a
thin wrapper — `--pr "$PR_NUMBER" --assert` — around
`@kurone-kito/idd-skill`'s `advisory-convergence.mjs` helper. The
same-HEAD reroll cap, Copilot stall-recovery state contract, and
maintainer-waiver backstop upstream added in `v0.5.0` all live inside
that vendored helper, not in the workflow YAML, so bumping the pinned
`idd-skill` version (issue #92, now `v0.6.0`) already brought this
workflow's *behavior* fully current with no shape change needed here.
This repository's own workflow file already matched upstream's
dogfooded copy (triggers, permissions, concurrency group, job id, even
the pinned `actions/checkout` SHA) before this issue, confirmed by a
line-by-line diff against `idd-skill`'s repository at the pinned
commit.

**Claimless external-check-waiver** (`v0.6.0`'s claim-id `none`
sentinel plus a `--claimless` authoring-CLI flag, for a waiver on a PR
with no active IDD claim to bind to) is deliberately **not** adopted:
this repository's PR history has exactly two authors,
`app/dependabot` (already exempt via `advisoryWait.exemptBotAuthoredPrs`)
and the sole maintainer (whose PRs always carry an active claim), so
the claim-id `none` sentinel has no real use case here. Revisit if this
repository ever accepts a non-bot, non-maintainer contribution.

### `post-merge-cleanup` workflow

`.github/workflows/post-merge-cleanup.yml` (added by issue #96,
mirroring `idd-template`'s `v0.6.0` core file) is a server-side
fallback for the agent's own F4 cleanup step
(`idd-merge.instructions.md`): it re-runs
`pnpm exec idd-audit-pr-cleanup --pr <n> --apply --skip-claim-check`
unconditionally on every merged PR, so cleanup coverage never depends
on the merging session having completed F4 itself (for example, a
session that exits at the F4/F5 boundary before posting evidence).
It skips posting a duplicate `<!-- idd-cleanup-evidence: -->` comment
when a trusted-author one already exists — the ordinary case, since
F4 already runs the same helper in-session.

It triggers on `pull_request_target: closed` (not `pull_request`) so a
fork PR's merge still runs it with base-repository credentials, gated
by `github.event.pull_request.merged == true` so it never fires on a
closed-without-merge PR. Two separate checkout steps handle the two
triggers: the `pull_request_target` path carries no `ref:` override at
all (resolving to that trigger's own trusted base-branch-tip default —
the pattern GitHub's `actions/untrusted-checkout` CodeQL query
recognizes as safe), and the `workflow_dispatch` path pins `ref:` to
the hardcoded default branch — never to `github.ref`'s own implicit
default, which for `workflow_dispatch` is whatever ref the dispatcher
targeted and is not restricted to a trusted value by the platform.
Neither path ever checks out PR-head content, and `permissions:` stays
`contents: read` / `issues: write` /
`pull-requests: write`, matching this workflow's actual mutation
surface (comment minimization and a single evidence comment; no
repository-content write). See the workflow file's own header comment
for the full trust-model rationale.

### `strip-untrusted-labels` workflow

`.github/workflows/strip-untrusted-labels.yml` (added by issue #65,
adapted from upstream `idd-skill`'s dogfooded
`docs/customization.md#reserved-label-guard-recipe`) removes a reserved
IDD label (the exact `roadmap` label, or any `status:*` label) the
instant `coderabbitai[bot]` applies it to an issue or pull request —
CodeRabbit auto-labels issues in this repository despite
`.coderabbit.yaml`'s `issue_enrichment.labeling.auto_apply_labels:
false` (confirmed by repeated reproduction in issue #65's history; a
dashboard-level override is suspected to take precedence over the
committed config), which would otherwise silently corrupt Discover's
routing (a mislabeled `roadmap` on an execution child routes it into
roadmap-audit handling instead of the normal claim path).

It triggers on `issues: labeled` / `pull_request_target: labeled`,
scoped by `github.event.sender.login` and `github.event.label.name` in
the job `if:` — no repository content is ever checked out and no
issue/PR-supplied content is executed, so a fork-originated
`pull_request_target` label event is safe to act on with
`issues: write` / `pull-requests: write` only. A human re-applying the
same label afterward is a separate event whose actor does not match, so
the guard never fights a genuine human decision. The actor list is
scoped to `coderabbitai[bot]` only — this repository's
`advisoryBotLogins` array also lists `copilot-pull-request-reviewer[bot]`
and `chatgpt-codex-connector[bot]`, but a full repository-wide sweep of
every `labeled` event in this repository's history found no label-write
activity from either, so they are excluded pending actual evidence
rather than copied from upstream's own (differently-scoped) hardcoded
list. See the workflow file's own header comment for the full
trust-model rationale and the evidence-sweep command.

### Worktree guard

**Policy**: `worktreeGuard.enabled: true` in `.github/idd/config.json`.
The guard refuses a commit or push made from the **primary** worktree
while `HEAD` is on an `issue/*` or `roadmap-audit/*` branch, enforcing
the B1 disposable-worktree rule locally (`--no-verify` bypasses it for
an intentional exception). CI cannot detect this class of violation —
it checks out a detached HEAD, which the guard treats as a no-op — so
this local hook, together with `idd-doctor --strict`, is the practical
enforcement surface.

**Deliberate divergence from the generic activation instructions**:
ONBOARDING.md's default guidance points `core.hooksPath` at
`.githooks`, assuming no other hook manager is in play. This repository
previously used **husky** (`core.hooksPath = .husky/_`) for
`lint-staged`/`commitlint`. Verified empirically that these two cannot
coexist: husky v9's `husky` CLI (run from the `prepare` npm script on
every `pnpm install`) unconditionally resets `core.hooksPath` back to
`.husky/_`, and `.husky/_`'s own hook files are auto-regenerated
one-line shims (`. "$(dirname "$0")/h"`) that never textually contain
the guard's `_idd-worktree-guard.sh` source line — so `idd-doctor`'s
own static self-check (`hookWiresWorktreeGuard`, which reads whatever
`core.hooksPath` resolves to) would report an "enabled-but-inert"
warning forever, even though the guard would actually run correctly
via husky-side chaining.

Resolved by **replacing husky with `.githooks`-based hooks entirely**,
rather than accepting the permanent false-positive warning:

- `.githooks/pre-commit` now runs the worktree guard, then
  `pnpm exec lint-staged -r` (previously husky's job).
- `.githooks/commit-msg` (new) runs `pnpm exec commitlint --edit "$1"`
  (previously husky's job).
- `.githooks/pre-push` is unchanged (guard only; this repository never
  had a husky `pre-push` hook to replace).
- The `husky` devDependency and `.husky/` directory are removed.
- `package.json`'s `prepare` script now runs the following instead of
  `husky`, so every `pnpm install` — including in a fresh clone, CI
  checkout, or coding-agent environment's setup step — wires the hooks
  with the same zero-manual-step convenience husky provided. No
  separate per-clone activation command is needed beyond the normal
  `pnpm install`.

  ```sh
  git rev-parse --git-dir > /dev/null 2>&1 || exit 0; git config core.hooksPath .githooks
  ```

  The `git rev-parse --git-dir` guard keeps this a no-op (exit 0) when
  `pnpm install` runs outside a Git worktree — a "Download ZIP"
  checkout or a registry-tarball install has no `.git` to configure,
  and hooks are meaningless there anyway. Inside a Git worktree, a
  genuine `git config` failure still propagates (fails the install)
  rather than being silently swallowed — an earlier `... || true`
  shape suppressed that class of failure too, which would have left
  hooks silently unwired (worktree guard, lint-staged, commitlint all
  inert) with no signal to the developer. This uses `exit 0` plus
  `;`/`||` chaining rather than `if`/`then`/`fi`: this repository's
  `pnpm-workspace.yaml` sets `shellEmulator: true` for cross-platform
  lifecycle scripts (Windows CI included), and that emulator supports
  simple command chaining but not full POSIX control-flow keywords —
  confirmed empirically (`if` fails with `command not found: if` under
  the emulator, even though it works under a real POSIX shell).

  The script intentionally does **not** `chmod +x` the hook files:
  `git ls-files -s .githooks/` already reports mode `100755` for
  `pre-commit`, `pre-push`, and `commit-msg`, and a normal
  `git checkout` restores that index-recorded mode on its own, so a
  dynamic `chmod` at install time never changed anything. Any *future*
  `.githooks/*` file must be committed with its executable bit already
  set — for example `git update-index --chmod=+x <path>` before
  committing, or by copying an existing hook file's mode — since
  `prepare` no longer fixes this up at install time.

`lint-staged`'s and `commitlint`'s own configuration
(`.lintstagedrc.mjs`, `.commitlintrc.yml`) are unchanged; only which
hook file invokes them changed.

## CHANGELOG Policy

**Policy**: confirmed by the maintainer (`kurone-kito`) on 2026-08-10
(issue #106).

- **Format**: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
  1.1.0. Each published package —
  `@kurone-kito/sea-builder`, `@kurone-kito/typescript-config`, and
  `@kurone-kito/vite-lib-config` — ships its own
  `packages/<name>/CHANGELOG.md`, listed in that package's
  `package.json` `files` array so it reaches the npm tarball (modern
  npm does **not** auto-include `CHANGELOG.md` the way it does
  `README*` / `LICENSE*` / `package.json`).
- **Release-time-batch-only rule**: `CHANGELOG.md` entries are added
  only as part of a release cut — never by an individual feature/fix
  PR. This repository runs parallel IDD agents, and every feature/fix
  PR editing the same shared `CHANGELOG.md` would be ordinary Git merge
  contention between concurrent branches — the
  `idd:discover-shared-file-overlap` helper's own high-contention set
  (the review/merge bundle files plus `audit/sync-manifest.json`) does
  not currently cover package changelogs, so this rule's purpose is
  avoiding that merge contention directly, not routing through that
  helper.
- **Per-package heading rule (lockstep versioning)**: the root and
  every package share one version number, but a package's CHANGELOG
  only gets a version heading for a release that actually changed that
  package. A release that did not touch a given package does not get
  an empty heading there — the three CHANGELOGs are expected to
  diverge in which version headings they contain, even though the
  version *numbers* they use stay shared across packages.
- **Release-cut procedure**: in the same pre-release change that bumps
  `package.json` versions:
  1. For every package the release actually changed, add an entry
     under its `## [Unreleased]` heading for each user-facing change
     since the last release (source: the merged PRs in range, using
     the same 🚀 Features / 🐛 Bug Fixes / 📝 Documentation /
     🧰 Maintenance categorization that `.github/release-drafter.yml`
     already applies).
  2. For every touched package that now has `[Unreleased]` entries,
     insert a new `## [<version>] - <YYYY-MM-DD>` heading directly
     below `## [Unreleased]` and move those entries under it, then
     leave `## [Unreleased]` in place, empty, ready for the next
     round. Never rename or remove the `## [Unreleased]` heading
     itself — the file always keeps exactly one, or the next release
     has no heading left to batch entries under.
  3. **Prerelease cuts** (`.github/workflows/release.yml`'s manual
     `workflow_dispatch` path, `next` tag, versions like
     `0.22.0-alpha.0`) do **not** get their own
     CHANGELOG heading — entries stay under `## [Unreleased]` through
     every prerelease cut and only move under a version heading when
     the corresponding **stable** release cuts, since a CHANGELOG
     records user-facing release notes, not internal prerelease
     iteration.

  See the matching step in the release checklist in
  [`.github/copilot-instructions.md`](../.github/copilot-instructions.md#release-checklist).
- **Enforcement** (issue #160): `pnpm run lint:changelog:check`
  (`scripts/check-changelog-policy.mjs`) is part of the `lint:*:check`
  family `pnpm run lint` runs, and also runs via `pnpm run lint:fix`'s
  `postlint:fix` hook — so every IDD **fix-validate** / **pre-push-validate**
  run sees it too. It fails when the diff against `origin/main` (or an
  explicit `MERGE_BASE` override) touches any `packages/*/CHANGELOG.md`
  path, citing this section, and fails closed if that base cannot be
  resolved. The release-cut change above is the one legitimate
  exception: set `IDD_CHANGELOG_RELEASE=1` when running lint for that
  change only, to let it edit these files.
