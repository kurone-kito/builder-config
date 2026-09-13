# IDD — PR Submit Phase (D)

Read this file after the self-review loop passes. It covers
pre-publication main sync, claim verification, tests, pushing, PR
creation, and waiting for CI.

Before the D1 sync and D2 push, apply the
[shared claim revalidation gate](idd-overview-core.instructions.md#claim-revalidation-gate).

## D1 — Sync main before first push

If the branch has not been pushed yet, sync it onto `main` before the
first push — the routine pre-publication history cleanup step. First run
`git fetch origin main`, then check whether the branch is **already
current** with `origin/main`: if `git merge-base HEAD origin/main` equals
`origin/main` (behind-count 0), the branch already contains every commit
on `main`, so the rebase would be a pure no-op. **Skip the rebase entirely
and proceed to D2** — D1's pre-publication synchronization goal is already
met. In a sibling-worktree setup a no-op `git rebase origin/main` can still
detach HEAD at the upstream tip without replaying the local commit, and
re-running that no-op rebase re-detaches every time, so the bounded
recovery below cannot converge for the no-op case; skipping it is the clean
exit.

Otherwise the branch **is** behind `origin/main`: rebase it onto `main`
(`git rebase origin/main`), then apply the post-rebase verification and
bounded recovery below.

After the first D-phase push, do not reuse D1 as the normal
synchronization path. Later branch updates should return through the
E-phase review loop and, by default, merge `main` into the published PR
branch so the synchronization diff is reviewable.

This D-phase file records the publication boundary only: post-push
synchronization itself runs through `idd-review-triage.instructions.md`'s
E-phase branch-sync check (`Esync`), which uses the
`branch-conflict-state` helper when helper runtime is enabled (a
`gh pr view` fallback otherwise), and `idd-resume.instructions.md`
already routes a content-conflicting branch there on restart.

If D1 itself reveals content conflicts before the first push, resolve
them and continue the rebase. After completing the rebase, if any files
were manually edited during conflict resolution, run **fix-validate**
and commit any resulting changes before proceeding.

On a signed-commit repo whose primary signing is non-interactive-hostile
(GPG pinentry or a hardware-touch path) but that provides a fallback
signing wrapper for arbitrary git subcommands (pass
`-c gpg.format=ssh -c user.signingkey=<abs-path> -c commit.gpgsign=true`
to `git` before the subcommand — `git -c … rebase`, not `git rebase -c …`
— or use a repo alias that wraps any subcommand; a commit-only alias like
`git commit-ssh` will not run `rebase`),
**run the initial `git rebase origin/main` above through that wrapper —
not the plain command — and continue it with the wrapper's own
`--continue` form**; the wrapper must own the whole operation. Plain
`git rebase --continue` re-signs the replayed commit through the
configured primary signing, which stalls non-interactively right after
the conflict is already resolved. This is the normal-path complement to
the recovery-path re-signing in Post-rebase verification below.

### Post-rebase verification

In a sibling-worktree setup, a rebase can leave HEAD **detached at the
upstream tip without replaying the local commit**: the branch ref is
preserved, but HEAD is moved off it. After the rebase completes and before
D2, verify both:

1. `git branch --show-current` is **non-empty** — HEAD is on the claimed
   branch, not detached.
2. The expected local commit is present in `main..HEAD` (for example,
   `git log --oneline main..HEAD` lists it).

If HEAD is detached (current branch empty), **auto-recover once**: re-attach
to the claimed branch with `git checkout {branch-name}` (the local commit is
preserved on the branch ref), re-run the D1 rebase, then re-verify both
checks. The re-rebase re-signs through the configured commit-signing path —
do not hardcode an ad-hoc key. On the signed-commit repos in the rebase
note above, run the re-rebase through that same fallback wrapper (the
repo's blessed fallback, not an ad-hoc pin), since the plain re-rebase
would stall on the non-interactive primary signing. If
recovery still fails (HEAD still detached or the
expected commit absent), post a hold note documenting the branch state and
stop; do not push.

This is the same divergence the shared
[claim revalidation gate](idd-overview-core.instructions.md#claim-revalidation-gate)
catches at the next mutation (current branch ≠ claimed branch); detecting it
here turns a confusing later failure into an immediate, recoverable signal.

## D2 — Verify claim, lint, test, push

1. Re-read the issue to confirm the claim is still yours: the **active
   claim** must still use your current `{claim-id}`. If the active claim
   is missing, released, or held by a different `{claim-id}` (even under
   the same agent ID), the claim was lost — report this and stop.
2. Run **pre-push-validate**.

   (E2E tests are verified by CI; do not run them locally.)
3. Push the branch to the remote. On the first publication push, use a
   normal push. If you are recovering an already-published branch under
   an explicit force-push exception, use `--force-with-lease` only when
   repository policy permits it and the exceptional route already
   required a rebase; otherwise stop and return to the merge-based sync
   path.

### Adding a new CI job

When this branch's diff introduces a **new** CI job, land it configured
for `workflow_dispatch` only, not yet wired to `push`/`pull_request`,
and validate it with manually dispatched runs against the pushed
branch (for example `gh workflow run <file> --ref <branch>`) before
making the one remaining edit that flips the trigger to its final
form. **Commit, re-run pre-push-validate, and push that edit before
creating the PR (D3)** — merging with the branch still dispatch-only
would never enable the job.

GitHub only allows a `workflow_dispatch` run once registered on the
default branch: `gh workflow run` cannot target a file or trigger that
exists only on the pushed branch. A first-time job needs a minimal
bootstrap merge first — trigger wiring only, job inert — via its own
preliminary PR (this repository merges only through PRs); this flow
then applies to the follow-up PR adding the real job, once that
scaffolding exists.

`on:` is workflow-file-scoped, not job-scoped: a new job in its own
file needs no cross-job isolation, but adding `workflow_dispatch` to
an existing multi-job file makes every job in it dispatchable.
Isolating the unproven job then is ordinary GitHub Actions authoring
(for example a job-level `if:`), scoped to that file's own jobs and
dependencies — keep it minimal, removing it with the trigger-flip edit
once validated. This step does **not** by itself reduce advisory-bot
review invocation count — that is driven by push count, not trigger
wiring. Its real benefit is avoiding wasted CI Actions-minutes and
false-failure noise from an unproven job auto-running on every
unrelated push.

For a Linux-runner job, also validate it locally with `nektos/act`
before pushing when `act` (and Docker) is available — per the
tool-availability convention in `idd-overview-core.instructions.md`'s
Project commands table, skip this otherwise and rely on the dispatch
validation above plus CI. `act`'s Docker-based execution cannot
validate `windows-latest`/`macos-latest` runner-specific behavior from
a WSL/Linux environment — never treat "validated via `act`" as
covering a Windows or macOS job.

Optionally, for a job `act` cannot validate where shakeout is long or
costly, a contributor may iterate it on a branch with no open PR yet,
landing only the validated final version on the actual PR branch.
Review automation that only fires on PR-associated pushes never runs
during that shakeout, avoiding review cost entirely — the one path
here that actually reduces it. This deviates from the normal
early-PR-then-iterate practice, so scope it to CI-infrastructure work,
as the implementer's choice, not a mandate.

Once the branch is pushed, treat it as published review history. A PR
that is merely `BEHIND` does not force a branch update by itself unless
branch protection or explicit repository policy requires an up-to-date
head before merge.

## D3 — Create PR

Before drafting the PR body, check whether the repository defines
`.github/pull_request_template.md`. If it exists, shape the PR body to
follow that template's section structure from the start, rather than
drafting free-form text and reconciling it against the template
afterward — repository review tooling (for example, CodeRabbit's
default description check) can compare the PR description against
that template when present, and a mismatched body can trigger an
avoidable advisory finding. If no template file exists, use the
structure below directly.

Use GH CLI or GH MCP to create the pull request. The PR body must
include the following content, mapped onto the template's sections
when one exists:

- A concise summary of the branch's changes
- A closing keyword on its own line linking the claimed issue (see
  Closing keyword below)
- Recommended follow-up issues (if any)
- Relevant background/rationale, when it materially affects review (for
  example, reuse constraints, intentional trade-offs, or non-goals).
  Include only context grounded in the issue discussion, commits, diff,
  or explicit operator instructions; omit rather than speculate.

### Closing keyword

The closing keyword must appear in the PR **body** (not the title) as
plain markdown text. Write a line such as Closes #N, Fixes #N, or
Resolves #N (case-insensitive) where N is the claimed issue number.
Render that example literally in the body — no backticks, no code
fences, no block-quote prefix.

When referring to keyword forms _as forms_ (not as the literal body
text), inline code is fine in surrounding prose; the no-wrapper
constraint applies only to the actual PR body content that GitHub
must parse.

GitHub recognizes the following keyword forms: close, closes, closed,
fix, fixes, fixed, resolve, resolves, resolved.

#### Anti-patterns

GitHub's closing-keyword detection does NOT activate when the keyword
is wrapped in any of these markdown forms — even if the underlying
text is correct:

- inline code (backtick-wrapped, e.g. `` `Closes #1` ``) — not
  detected
- fenced code block (triple backtick or triple tilde) — not detected
- block quote prefix (`>` at line start) — not detected

When detection fails, GitHub will not auto-close the linked issue on
merge and the issue↔PR linking surfaces (sidebar, timeline) will not
populate.

**Mirror false-positive — negation-blind detection**: the same literal
matching runs in the other direction too. GitHub's detector matches a
recognized keyword form immediately adjacent to a `#N` reference and
has no concept of negation — wrapping the keyword in surrounding
"not" / "deliberately" / "isn't" wording does not stop detection when
the keyword itself still sits next to the `#N` it must not close. Keep
every recognized keyword form (`close`, `closes`, `closed`, `fix`,
`fixes`, `fixed`, `resolve`, `resolves`, `resolved`) structurally apart
from any reference it must not close:

- Risky — a keyword sits directly before the reference, even inside a
  negation clause: "this PR does not close #42" (`close` is
  immediately adjacent to `#42`; GitHub cannot see the "not").
- Safe — reorder so no recognized keyword is adjacent to the
  reference: "Refs #42 (deliberately not a closing keyword — see the
  discussion there for why this PR does not resolve it directly)".
  Here `resolve` is followed by "it", not a `#N` token, so nothing
  adjacent to `#42` matches.

Do not rely on careful phrasing alone as the only safeguard — the
strengthened check in D3.5 below verifies `closingIssuesReferences`
against the deliberate closing set exactly, catching a spurious extra
close even if phrasing slips.

#### Multiple closing issues

When the PR closes more than one issue, repeat the keyword for each
reference. Both keywords must appear in plain body text for GitHub to
auto-close both issues:

- Works — a body line written as Closes #1, closes #2 (GitHub parses
  each keyword + reference pair).
- Does **not** work — a body line written as Closes #1, #2 (no
  keyword precedes the second reference, so #2 is not auto-closed).

After creating the PR, if the repository has CODEOWNER rules or expected
reviewers that are not auto-assigned by GitHub, request them explicitly:

```sh
gh pr edit {pr-number} --add-reviewer {reviewer-login}
```

**Do not create follow-up issues directly.** An executing IDD session
must never call `gh issue create` (or the REST issues API) itself.
Recommended follow-ups stay in the PR body's own prose above. If a
follow-up is important enough to file in-repo now, invoke the
`issue-authoring` skill (its Stage 1 hold) instead of improvising a
body. Do not add a parallel "worker-lite authoring" contract.

### Live-operator-directed immediate-fix carve-out

The "never call `gh issue create`" rule immediately above assumes
unattended execution with no live operator present. When a live
operator is present during a claimed issue's own execution and directs
an immediate fix for a blocking bug unrelated to the claimed work, the
session may proceed with that fix under the operator's live authority
instead of routing it through the `issue-authoring` skill first.
Minimum provenance: the side-fix PR body must cross-reference the
originating claimed issue using a **non-closing cross-reference** (for
example, `Refs #<claimed-issue-number>` — never a closing keyword such
as `Closes`/`Fixes`/`Resolves`, which would auto-close the originating
issue on the side-fix's own merge). Formal `issue-authoring` tracking
is still preferred when time allows, but it is not a start blocker for
this carve-out.

How the executing session obtains a branch, worktree, and claim for
the side-fix while the originating claim stays active — and how the
side-fix's own merge and cleanup avoid releasing that originating
claim — is not yet defined. The shared claim revalidation gate
(`idd-overview-core.instructions.md`) scopes its cwd-vs-claim check off
the active claim's recorded `branch:` field, not the mutation's target
branch, so no branch-naming convention alone exempts a same-session
side-fix from it. Treat this as an open gap: this carve-out authorizes
the _decision_ to proceed under live authority; the operator directing
it owns the mechanics until a follow-up defines them.

D3's closing-keyword requirement and D3.5's presence-detection and
auto-injection (steps 1-5, including step 4) apply only to the
side-fix PR's own deliberate closing set — its own linked issue, if
any, or none otherwise — never to the originating claimed issue named
above; do not let them treat the non-closing cross-reference above as
missing, or rewrite it into a closing keyword. The originating claimed
issue must not appear in the side-fix PR's `closingIssuesReferences`,
and the side-fix branch's commit messages must not contain a closing
keyword referencing it — still run D3.5 step 6's exact-set comparison
and step 7's commit-message scan to confirm both, treating the
originating issue as outside the side-fix PR's deliberate closing set.

While a side-fix PR that the claimed issue's PR depends on is in
flight, periodically re-check the claimed issue's own PR review and CI
state — unresolved review threads and failing checks — rather than
discovering that backlog only after the side-fix merges.

### D3.7 — Derive the IDD impact checklist

Skip this sub-step entirely when `.github/pull_request_template.md`
does not exist or has no `IDD impact` heading — mirroring D3's own "If
no template file exists, use the structure below directly" fallback,
there is no checklist to derive or reconcile. When it exists, the
template's IDD impact checklist (`Instruction files changed` /
`Template files changed` / `Helper scripts changed` / `Config schema
changed` / `Security / credential / merge behavior changed`) is
drafted from the branch's actual changed-file list, not from memory.
Before drafting the body, list the branch's changes
(`git diff --name-only origin/main...HEAD`) and derive each checkbox
mechanically, using a root-anchored path-prefix match (the path starts
with the glob's literal prefix, not merely contains it):

- **Instruction files changed** — any path starting with
  `.github/instructions/`.
- **Template files changed** — not applicable to this repository (it
  imports the template, it does not vendor one under an `idd-template/`
  path); leave unchecked.
- **Helper scripts changed** — any path starting with `scripts/`.
- **Config schema changed** — `audit/sync-manifest.json`,
  `.github/idd/config.json`, or another repository-designated
  config-schema-bearing file.
- **Security / credential / merge behavior changed** stays a judgment
  call — leave it to ordinary self-review discretion; it is not
  mechanically derivable from paths alone.

Re-derive this same checklist against the final HEAD immediately
before merge — later commits (a review-fix round, a critique-pass fix
landed before the first push) can change the answer.
`idd-pre-merge.instructions.md`'s F2 "Closing-set and
impact-checklist re-verification" condition re-triggers this
re-derivation by name (as D3.7) before F3, so no gap remains here.

### PR body language

The PR body's prose sections above (summary, background/rationale,
follow-up notes) follow the resolved `authoringLanguage` value from
`.github/idd/config.json`: a fixed BCP-47-shaped language tag (for
example `en`, `ja`, `fr`) when configured, the claimed issue's own body
language when the value is the literal `match-source` (this file's
unattended-execution case, with no live operator to match a live
conversational language against), or English when the field is absent
(fail-safe default, matching today's emergent behavior).

This never changes a machine-parsed marker or an exact-regex-matched
visible line, which always stays in its canonical form regardless of
`authoringLanguage`. Concretely here, the closing keyword line below
(`Closes #N` and its variants) must keep its exact English keyword
form: GitHub's own closing-keyword parser and this file's D3.5
verification regex both match only the English keyword forms
(`close[sd]?`/`fix(e[sd])?`/`resolve[sd]?`), so translating that line
would silently break auto-close detection.

### D3.5 — Verify closing keyword detection

After PR creation and before D4, confirm GitHub recognized the
closing keyword for the claimed issue. Resume routing should re-enter
this sub-step when a session restarts after PR creation but before CI
completion.

1. Re-fetch the PR body:

   ```sh
   gh pr view <pr-number> --json body --jq '.body'
   ```

2. Strip regions GitHub does not parse for closing keywords:

   - lines inside fenced code blocks (triple backtick or triple tilde)
   - spans inside inline code (single backticks)
   - lines beginning with `>` (block-quote prefix) after leading
     whitespace

3. Search the remaining plain-text body for a closing keyword
   referencing the **claimed issue number** `<N>`, using a regex
   equivalent to:

   ```text
   (?im)\b(close[sd]?|fix(e[sd])?|resolve[sd]?)\s+#<N>\b
   ```

4. **If no match in the stripped body**:

   - Edit the PR body with
     `gh pr edit <pr-number> --body <updated-body>` to add a
     correctly placed plain-text closing keyword line (e.g.,
     `Closes #<N>` as its own line, outside any code fence or
     block quote).
   - Repeat steps 1–3 once.
   - If the second self-check still fails, post a hold note on the
     issue citing the PR URL and stop. Do not proceed to D4.

5. **If the keyword exists only inside a stripped region**: report
   which wrapper form was detected (inline code, fenced block, or
   block-quote prefix) and apply the same edit-and-recheck path
   as step 4.

6. **Confirm the closing set matches exactly**: GitHub's
   `closingIssuesReferences` field on the PR
   (`gh pr view <pr-number> --json closingIssuesReferences --jq
   '.closingIssuesReferences[].number'`) lists every issue GitHub plans
   to close when the PR merges. Compare it against the deliberate
   closing set from D3 — normally just the claimed issue `<N>`, or the
   full deliberate multi-issue set when "Multiple closing issues" above
   applies. The two sets must be **exactly** equal; steps 1-5 above
   only confirm the claimed issue `<N>` is present, so this step is the
   only one that catches either direction of mismatch:

   - **An extra entry** (a `closingIssuesReferences` issue outside the
     deliberate set) is most often the negation-blind false-positive
     documented above, where an unrelated `#M` reference ends up
     adjacent to a recognized keyword elsewhere in the body. Edit the
     PR body to separate the keyword from that `#M` reference.
   - **A missing entry** (a deliberate multi-issue-close target absent
     from `closingIssuesReferences`) means its keyword did not
     register — apply the same edit-and-recheck path as step 4 for
     that issue number.

   Repeat this step once after either fix. If it still fails, post a
   hold note on the issue citing the PR URL and stop. Do not proceed to
   D4.

7. **Scan the branch's own commit messages**: GitHub's merge-time
   closing-keyword scan also reads commit messages (subject and body),
   not only the PR body, so a stray keyword there can auto-close an
   issue outside the deliberate set even when the PR body is clean.
   List the branch's own commits, using a visible delimiter rather
   than a NUL byte so common terminals and search tools don't treat
   the output as binary:

   ```sh
   git log origin/main..HEAD --pretty=format:'%H%n%B%n===commit-boundary==='
   ```

   For each commit's full message, search using step 3's same keyword
   alternation, generalized to any issue number instead of the fixed
   `<N>`, and to both a repository-qualified form and GitHub's full-URL
   form (both also auto-close, so either is exactly as unsafe as an
   unqualified reference):

   ```text
   (?im)\b(close[sd]?|fix(e[sd])?|resolve[sd]?)\s+((?:[\w.-]+\/[\w.-]+)?#\d+|https://github\.com/[\w.-]+/[\w.-]+/issues/\d+)\b
   ```

   For each match, extract the referenced repository (present for a
   qualified `owner/repo#N` or a full-URL match; absent for a bare
   `#N`, which always means this repository) and the issue number. A
   match is expected only when the referenced repository is **either**
   absent **or** equal to this repository, **and** the issue number is
   in the deliberate closing set from D3 (this covers both the
   single-issue `<N>` case and "Multiple closing issues" above); a
   match naming a different repository is always a stray close
   regardless of whether its number coincides with one in the
   deliberate set, and a same-repository number outside that set is
   also a stray commit-message close.

   **On a stray match**: amend the offending commit (`git commit
   --amend` for the tip commit, or an interactive rebase for an
   earlier one). If the branch already carries a merge commit (for
   example, from an E-phase `main` sync), rebase with `--rebase-merges`
   instead of a plain interactive rebase, so the merge and its recorded
   conflict resolution aren't silently linearized or dropped. On a
   signed-commit repo whose primary signing is non-interactive-hostile,
   run the amend or rebase through the same D1 fallback-signing wrapper
   noted above, including any rebase continuation — the plain command
   can stall the same way D1 already documents. Then force-push the
   correction (`git push --force-with-lease`) only when repository
   policy permits force-pushing a published branch, mirroring D2's own
   force-push restriction; if it does not, hold for operator
   intervention instead of rewriting published history. **Amend before
   merge** — this scan runs at merge time, so the fix must land before
   the PR merges; a commit message caught only after merge cannot be
   amended, and recovery requires reopening the affected issue by hand.
   Repeat this step once after the amendment. If it still finds a stray
   match, post a hold note on the issue citing the PR URL and stop. Do
   not proceed to D4.

   **Re-run before merge**: this scan only covers commits present at
   D3.5 time. Later branch commits — accepted review fixes
   (`idd-review-fix.instructions.md` E9-E12) or a `main` merge — are not
   automatically covered by this D3-time pass; `idd-pre-merge.instructions.md`'s
   F2 condition re-runs this same scan against the final HEAD before F3.

## D4 — Wait for CI

Schedule a wake, or background this wait only if the
topology-safety condition holds (confirmed to route completion back to
this turn); otherwise wait synchronously — block with:

- `gh run watch <run-id> --exit-status` (single workflow run; not
  usable on a fine-grained PAT)
- `gh pr checks <pr-number> --watch --required` (PR required-check
  rollup)

See [idd-ci.instructions.md's Wake-up
discipline](idd-ci.instructions.md#wake-up-discipline) for the
caveats on both. Do not `run_in_background` this wait absent the
confirmed condition above. Delegate polling mechanics to
`idd-ci.instructions.md`.

- **On success** → proceed to `idd-review-snapshot.instructions.md`
- **`idd-advisory-convergence` is the sole non-pass required check, and
  its own verdict — a JSON object printed in that check's run log, whose
  `pending` field is distinct from any GitHub check-run status —
  reports `pending: false` with outstanding review reasons** (thread
  disposition, actionable item count on the latest review, or
  both; see `idd-ci.instructions.md` §Interpretation for this shared
  trigger condition) → this is not a CI-wait state: the
  check turns green only after E-phase disposition, which is downstream
  of D4, so continued polling cannot resolve it, and a
  `ciWait.rerunPolicy` rerun only reproduces the same red **unless a
  maintainer has since posted a valid external-check waiver for this
  HEAD** — that case still needs the rerun, to make the check reflect
  the waiver (a pre-existing F2/F3 concern this branch leaves unchanged;
  see `idd-pre-merge.instructions.md`'s External-check waivers). Absent
  a waiver, exit CI-wait and proceed directly to
  `idd-review-snapshot.instructions.md` (E1) instead, matching the phase
  routing table's "PR open, CI running, reviews exist" row. This does
  not relax the merge gate — the check stays required, and F2
  re-verifies it independently before merge.
