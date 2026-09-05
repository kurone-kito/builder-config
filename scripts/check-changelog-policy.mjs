#!/usr/bin/env node

/**
 * Enforces this repository's release-time-batch-only CHANGELOG policy
 * (see `docs/idd-policy.md`, "CHANGELOG Policy"): `packages/<name>/CHANGELOG.md`
 * is edited only in the same pre-release change that bumps `package.json`
 * versions, never by an individual feature/fix pull request.
 *
 * Fails when the diff against the resolved base (an explicit `MERGE_BASE`
 * env var, or otherwise `git merge-base HEAD origin/main`) touches any
 * `packages/<name>/CHANGELOG.md` path. Fails closed - a nonzero exit code -
 * whenever that base cannot be resolved, rather than silently passing.
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
 * Best-effort: make `origin/main` resolvable locally, fetching (and
 * unshallowing first, when needed) it if it isn't already known. A CI
 * checkout defaults to a single-branch shallow clone, so `origin/main` is
 * usually absent until this runs; a normal development worktree already
 * has it from `git fetch origin main`, so this is then a cheap no-op.
 * @returns {boolean}
 */
function ensureOriginMain() {
  if (tryGit(['rev-parse', '--verify', 'origin/main']) !== undefined)
    return true;
  const isShallow = tryGit(['rev-parse', '--is-shallow-repository']) === 'true';
  const fetchArgs = [
    'fetch',
    ...(isShallow ? ['--unshallow'] : []),
    'origin',
    'main:refs/remotes/origin/main',
  ];
  if (tryGit(fetchArgs) === undefined) return false;
  return tryGit(['rev-parse', '--verify', 'origin/main']) !== undefined;
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
  if (!ensureOriginMain()) return undefined;
  return tryGit(['merge-base', 'HEAD', 'origin/main']);
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
 * @param {string} base
 * @returns {boolean} whether root `package.json` and every
 *   `packages/<name>/package.json` all bump their `version`, from `base`,
 *   to root's current version in lockstep - this repository's actual
 *   release-cut contract, not merely "some version somewhere changed".
 */
function isLockstepVersionBump(base) {
  const rootBase = readVersionAt(base, 'package.json');
  const rootCurrent = readCurrentVersion('package.json');
  if (
    rootBase === undefined ||
    rootCurrent === undefined ||
    rootBase === rootCurrent
  ) {
    return false;
  }

  const manifests = listPackageManifests();
  if (manifests.length === 0) return false;

  return manifests.every((manifestPath) => {
    const baseVersion = readVersionAt(base, manifestPath);
    const currentVersion = readCurrentVersion(manifestPath);
    return (
      baseVersion !== undefined &&
      baseVersion !== currentVersion &&
      currentVersion === rootCurrent
    );
  });
}

function main() {
  const base = resolveBase();
  if (!base) {
    console.error(
      '[lint:changelog] Could not resolve origin/main (or MERGE_BASE) to diff against. ' +
        `Failing closed per ${POLICY_DOC}. Ensure origin/main is fetchable, or set MERGE_BASE explicitly, then retry.`,
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

  if (process.env.IDD_CHANGELOG_RELEASE === '1') {
    console.log(
      '[lint:changelog] IDD_CHANGELOG_RELEASE is set - skipping the package CHANGELOG.md guard for this release-cut change.',
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
