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
 * Escape hatch: set `IDD_CHANGELOG_RELEASE=1` for the one release-cut
 * change that legitimately edits these files.
 */

import { execFileSync } from 'node:child_process';

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
  if (override) return override;
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

function main() {
  if (process.env.IDD_CHANGELOG_RELEASE === '1') {
    console.log(
      '[lint:changelog] IDD_CHANGELOG_RELEASE is set - skipping the package CHANGELOG.md guard for this release-cut change.',
    );
    return;
  }

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
  if (offending.length > 0) {
    console.error(
      "[lint:changelog] This change edits a package CHANGELOG.md, which this repository's " +
        `release-time-batch-only policy (${POLICY_DOC}) reserves for the release-cut change ` +
        'that bumps package.json versions - never a feature/fix PR. Drop this hunk:\n' +
        offending.map((path) => `  - ${path}`).join('\n') +
        '\nIf this genuinely is the release-cut change, set IDD_CHANGELOG_RELEASE=1 and re-run.',
    );
    process.exitCode = 1;
  }
}

main();
