#!/usr/bin/env node

/**
 * Enforces this repository's release-time-batch-only CHANGELOG policy
 * (see `docs/idd-policy.md`, "CHANGELOG Policy"): `packages/<name>/CHANGELOG.md`
 * is edited only in the same pre-release change that bumps `package.json`
 * versions, never by an individual feature/fix pull request.
 *
 * Fails when the diff against the resolved base (an explicit `MERGE_BASE`
 * env var, or otherwise `git merge-base HEAD <remote main SHA>`, querying
 * `origin` directly rather than any locally-cached tracking ref) touches
 * any `packages/<name>/CHANGELOG.md` path. Fails closed - a nonzero exit
 * code - whenever that base cannot be resolved, rather than silently
 * passing.
 *
 * A genuine release cut is detected automatically: the root `package.json`
 * and every `packages/<name>/package.json` must all bump their `version`
 * field, from the resolved base, to the same new value as root's current
 * version - the lockstep versioning this repository's release-cut policy
 * already requires. This is deliberately tied to that whole-workspace diff
 * shape rather than a PR title or commit message (freely chosen by the PR
 * author) or a bump of the root version alone (trivially added without
 * touching any package that actually publishes) - either shortcut would
 * let an ordinary feature/fix PR bypass the guard without a genuine
 * release cut.
 *
 * Escape hatch: set `IDD_CHANGELOG_RELEASE=1` for the rarer case of a
 * legitimate CHANGELOG.md edit with no version bump (for example,
 * historical backfill work).
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

const CHANGELOG_PATTERN = /^packages\/[^/]+\/CHANGELOG\.md$/;
const POLICY_DOC = 'docs/idd-policy.md ("CHANGELOG Policy" section)';

/**
 * Run a git subcommand and return its trimmed stdout, or `undefined` when
 * the command fails.
 * @param {readonly string[]} args
 * @returns {string | undefined}
 */
function tryGit(args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return undefined;
  }
}

/**
 * Ask the remote directly for `refs/heads/main`'s current commit SHA,
 * rather than trusting any locally-cached `origin/main` tracking ref. A
 * long-lived local clone (or a worktree sibling of one) can have a stale
 * ref that predates the last real release, which would otherwise make an
 * already-merged version bump look like part of the current diff and
 * defeat `isLockstepVersionBump()` below. The fully-qualified
 * `refs/heads/main` (not the bare `main` short name) matters here: `git
 * ls-remote` resolves a bare short name against every ref namespace, so it
 * would also match a same-named tag (verified directly - pushing a
 * `refs/tags/main` tag to a bare remote with no `main` branch still makes
 * `ls-remote origin main` resolve successfully), silently comparing
 * against the wrong ref entirely.
 * @returns {{ status: 'resolved', sha: string } | { status: 'branch-absent' } | { status: 'unreachable' }}
 */
function remoteMainSha() {
  try {
    const out = execFileSync(
      'git',
      ['ls-remote', '--exit-code', 'origin', 'refs/heads/main'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim();
    const sha = out.split(/\s+/)[0];
    return sha ? { status: 'resolved', sha } : { status: 'unreachable' };
  } catch (error) {
    // `--exit-code` reserves exit code 2 specifically for "the remote was
    // reached, but no ref matched" - every other nonzero exit (including a
    // transport failure) falls through as a genuine connectivity problem.
    return error?.status === 2
      ? { status: 'branch-absent' }
      : { status: 'unreachable' };
  }
}

/**
 * Make a commit's full ancestry available locally, fetching (and
 * unshallowing first, when needed) unless it's already available in a
 * non-shallow repository. This plain `fetch origin main` still updates the
 * shared `refs/remotes/origin/main` tracking ref as a side effect (every
 * workspace worktree shares one set of refs and objects) - the safety
 * property here is narrower than "never touches that ref": this function
 * never *reads* `origin/main` back afterward, depending only on the
 * caller's already-resolved `sha` (from `remoteMainSha()`) instead. That
 * matters because several worktrees of this same clone can run this script
 * around the same time (each on its own branch); reading the shared ref
 * back immediately after a fetch can transiently see it deleted mid-update
 * by a sibling worktree's own concurrent fetch (reproduced directly), even
 * though the fetch that caused it succeeds. Never reading it back
 * sidesteps that race entirely.
 *
 * A shallow repository always re-fetches (via `--unshallow`) even when
 * `sha`'s own commit object already resolves: a CI checkout's default
 * shallow depth can already hold main's tip object without holding enough
 * history for `merge-base` against a differently-shallow-fetched HEAD to
 * mean anything (reproduced directly against two independent depth-1
 * fetches) - object presence alone doesn't prove ancestry is present too.
 * A shallow repository's `--unshallow` fetch must also actually succeed:
 * if it fails (a transient network or auth error), the commit object can
 * still happen to already resolve from the original shallow fetch, which
 * would otherwise let this return `true` while the repository is still
 * shallow and any subsequent `merge-base` result stays meaningless -
 * treat a failed unshallow as unavailable outright rather than falling
 * through to that stale check.
 * @param {string} sha
 * @returns {boolean}
 */
function ensureCommitAvailable(sha) {
  const commitRef = `${sha}^{commit}`;
  const isShallow = tryGit(['rev-parse', '--is-shallow-repository']) === 'true';
  if (!isShallow && tryGit(['cat-file', '-e', commitRef]) !== undefined) {
    return true;
  }
  const fetchArgs = [
    'fetch',
    ...(isShallow ? ['--unshallow'] : []),
    'origin',
    'refs/heads/main',
  ];
  const fetchSucceeded = tryGit(fetchArgs) !== undefined;
  if (isShallow && !fetchSucceeded) return false;
  return tryGit(['cat-file', '-e', commitRef]) !== undefined;
}

/** @returns {string | undefined} */
function resolveBase() {
  const override = process.env.MERGE_BASE?.trim();
  if (override) {
    // Resolve (and normalize to a full SHA) through `rev-parse --verify`
    // rather than passing the raw override straight to `git diff`: an
    // override that happens to match a real `git diff` flag (e.g.
    // `--stat`) would otherwise be parsed as an option instead of a
    // revision, silently retargeting the diff and risking a false pass.
    // `--end-of-options` keeps a flag-shaped override from being
    // interpreted as a `rev-parse` option too.
    return tryGit([
      'rev-parse',
      '--verify',
      '--end-of-options',
      `${override}^{commit}`,
    ]);
  }
  const remote = remoteMainSha();
  if (remote.status === 'resolved') {
    return ensureCommitAvailable(remote.sha)
      ? tryGit(['merge-base', 'HEAD', remote.sha])
      : undefined;
  }
  if (remote.status === 'branch-absent') {
    // The remote was reached, but it genuinely has no refs/heads/main -
    // never fall back to a locally-cached ref here, unlike the
    // `unreachable` case below: an unexpectedly branch-less remote is a
    // hard failure signal (wrong repository, renamed default branch),
    // not the kind of transient offline degradation the cached fallback
    // exists for.
    return undefined;
  }
  // The live remote query itself failed to connect (for example, no
  // network) rather than reaching the remote and finding no match - fall
  // back to whatever origin/main already resolves to locally instead of
  // blocking a disconnected developer outright, only when a fresh answer
  // was never reachable in the first place.
  const cachedSha = tryGit([
    'rev-parse',
    '--verify',
    'refs/remotes/origin/main',
  ]);
  return cachedSha && ensureCommitAvailable(cachedSha)
    ? tryGit(['merge-base', 'HEAD', cachedSha])
    : undefined;
}

/**
 * @param {string} base
 * @returns {readonly string[] | undefined}
 */
function changedPaths(base) {
  const diffOut = tryGit(['diff', '--name-only', base]);
  return diffOut === undefined
    ? undefined
    : diffOut.split(/\r?\n/).filter(Boolean);
}

/**
 * Read a `package.json`'s `version` field as committed at `ref`, or
 * `undefined` when the ref, file, or JSON can't be resolved.
 * @param {string} ref
 * @param {string} manifestPath
 * @returns {string | undefined}
 */
function readVersionAt(ref, manifestPath) {
  const content = tryGit(['show', `${ref}:${manifestPath}`]);
  if (content === undefined) return undefined;
  try {
    return JSON.parse(content).version;
  } catch {
    return undefined;
  }
}

/**
 * Read the working tree's current `version` field for a `package.json`, or
 * `undefined` when the file can't be read or parsed.
 * @param {string} manifestPath
 * @returns {string | undefined}
 */
function readCurrentVersion(manifestPath) {
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8')).version;
  } catch {
    return undefined;
  }
}

/**
 * Every workspace package manifest path (`packages/<name>/package.json`),
 * discovered from the current working tree's `packages/` directory rather
 * than a hardcoded list, so this stays correct as packages are added or
 * removed.
 * @returns {readonly string[]}
 */
function listPackageManifests() {
  let entries;
  try {
    entries = readdirSync('packages', { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => `packages/${entry.name}/package.json`)
    .sort();
}

/**
 * Compare two dot-separated SemVer prerelease identifier strings (the part
 * after the first `-`) using SemVer's actual precedence rule: identifiers
 * compare pairwise, numeric identifiers compare numerically, alphanumeric
 * identifiers compare lexically, a numeric identifier always has lower
 * precedence than an alphanumeric one, and a shorter identifier list has
 * lower precedence than a longer one that agrees on every shared field (so
 * this repository's own real `0.22.0-alpha.10` → `0.22.0-alpha.11` bump
 * compares as a genuine increase, not a tie).
 * @param {string} a
 * @param {string} b
 * @returns {number} negative if `a` < `b`, positive if `a` > `b`, `0` if
 *   equal.
 */
function comparePrereleaseIdentifiers(a, b) {
  const partsA = a.split('.');
  const partsB = b.split('.');
  const length = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < length; i += 1) {
    if (i >= partsA.length) return -1;
    if (i >= partsB.length) return 1;
    const [ia, ib] = [partsA[i], partsB[i]];
    const [na, nb] = [ia, ib].map((identifier) =>
      /^\d+$/.test(identifier) ? Number(identifier) : undefined,
    );
    if (na !== undefined && nb !== undefined) {
      if (na !== nb) return na - nb;
      continue;
    }
    if (na !== undefined) return -1;
    if (nb !== undefined) return 1;
    if (ia !== ib) return ia < ib ? -1 : 1;
  }
  return 0;
}

/**
 * Minimal, good-enough SemVer-style comparator for `isLockstepVersionBump()`
 * below: parses each `major.minor.patch(-prerelease)?` string and compares
 * numeric components in order, falling back to prerelease precedence (via
 * `comparePrereleaseIdentifiers()`, or "a release outranks the same core
 * version with a prerelease suffix" when only one side has one) when every
 * numeric component ties. Not a full SemVer implementation (no
 * build-metadata handling) - just enough to reliably reject a downgrade or
 * a same-value "bump" for the version strings this repository actually
 * uses, while still recognizing a genuine prerelease-to-prerelease bump
 * (this repository has cut real `X.Y.Z-alpha.N` releases before).
 * @param {string} a
 * @param {string} b
 * @returns {number} negative if `a` < `b`, positive if `a` > `b`, `0` if
 *   equal or unparseable (an unparseable pair is never treated as a
 *   genuine bump).
 */
function compareVersions(a, b) {
  const parse = (v) => {
    const [core, prerelease] = v.split('-', 2);
    return { parts: core.split('.').map(Number), prerelease };
  };
  const pa = parse(a);
  const pb = parse(b);
  if ([...pa.parts, ...pb.parts].some(Number.isNaN)) return 0;
  const length = Math.max(pa.parts.length, pb.parts.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (pa.parts[i] ?? 0) - (pb.parts[i] ?? 0);
    if (diff !== 0) return diff;
  }
  if (pa.prerelease === pb.prerelease) return 0;
  if (pa.prerelease === undefined) return 1;
  if (pb.prerelease === undefined) return -1;
  return comparePrereleaseIdentifiers(pa.prerelease, pb.prerelease);
}

/**
 * @param {string} base
 * @returns {boolean} whether root `package.json` bumped its `version` from
 *   `base` to a genuinely newer version (never a downgrade or a same-value
 *   edit), and every current `packages/<name>/package.json` shares that
 *   same new version - this repository's actual lockstep release-cut
 *   contract, not merely "some version somewhere changed". Comparing only
 *   current versions (not each package's own version at `base`) means a
 *   package newly added in this same diff - with no prior version to
 *   compare against - is handled the same way as an existing one: it only
 *   needs to already be at the release version, not show its own bump.
 */
function isLockstepVersionBump(base) {
  const rootBase = readVersionAt(base, 'package.json');
  const rootCurrent = readCurrentVersion('package.json');
  if (
    rootBase === undefined ||
    rootCurrent === undefined ||
    compareVersions(rootCurrent, rootBase) <= 0
  ) {
    return false;
  }

  const manifests = listPackageManifests();
  if (manifests.length === 0) return false;

  return manifests.every(
    (manifestPath) => readCurrentVersion(manifestPath) === rootCurrent,
  );
}

function main() {
  // Checked first, before any base resolution: a human explicitly asserting
  // this is a legitimate CHANGELOG.md edit shouldn't also need git/origin
  // connectivity to succeed - an offline clone or a checkout with no
  // `origin` remote must still be able to honor this override.
  if (process.env.IDD_CHANGELOG_RELEASE === '1') {
    console.log(
      '[lint:changelog] IDD_CHANGELOG_RELEASE is set - skipping the package CHANGELOG.md guard ' +
        'entirely for this manually-confirmed change.',
    );
    return;
  }

  const base = resolveBase();
  if (!base) {
    console.error(
      "[lint:changelog] Could not resolve main's current commit (or MERGE_BASE) to diff against. " +
        `Failing closed per ${POLICY_DOC}. Ensure origin is reachable, or set MERGE_BASE or ` +
        'IDD_CHANGELOG_RELEASE=1 explicitly, then retry.',
    );
    process.exitCode = 1;
    return;
  }

  const paths = changedPaths(base);
  if (paths === undefined) {
    console.error(
      `[lint:changelog] "git diff --name-only ${base}" failed. Failing closed per ${POLICY_DOC}.`,
    );
    process.exitCode = 1;
    return;
  }

  const offending = paths.filter((path) => CHANGELOG_PATTERN.test(path));
  if (offending.length === 0) return;

  if (isLockstepVersionBump(base)) {
    console.log(
      "[lint:changelog] root and every workspace package's version bumped in lockstep against " +
        'the resolved base - treating this as the release-cut change and allowing the package ' +
        'CHANGELOG.md edit(s).',
    );
    return;
  }

  console.error(
    "[lint:changelog] This change edits a package CHANGELOG.md, which this repository's " +
      `release-time-batch-only policy (${POLICY_DOC}) reserves for the release-cut change ` +
      'that bumps package.json versions - never a feature/fix PR. Drop this hunk:\n' +
      offending.map((path) => `  - ${path}`).join('\n') +
      '\nIf this genuinely is the release-cut change, bump the root package.json and every ' +
      "workspace package's package.json to the same new version, or set " +
      'IDD_CHANGELOG_RELEASE=1 and re-run.',
  );
  process.exitCode = 1;
}

main();
