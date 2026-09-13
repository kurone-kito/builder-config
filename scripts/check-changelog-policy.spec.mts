/**
 * Black-box integration tests for `check-changelog-policy.mjs`: every
 * scenario spawns the real script (unmodified - this test file adds zero
 * changes to its logic) as a subprocess against a disposable scratch git
 * repository with its own bare "origin" remote, so `git ls-remote`,
 * `git fetch`, `git diff`, and `git merge-base` all run for real, isolated
 * from this checkout's own git state.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const scriptPath = fileURLToPath(
  new URL('./check-changelog-policy.mjs', import.meta.url),
);

/** Directories created by the current test, removed in `afterEach`. */
let scratchDirs: string[] = [];

afterEach(() => {
  for (const dir of scratchDirs) {
    rmSync(dir, { force: true, maxRetries: 3, recursive: true });
  }
  scratchDirs = [];
});

/**
 * Runs a git subcommand in `cwd`, returning trimmed stdout. Strips
 * `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` from the inherited
 * environment - an ambient value for any of them would otherwise let
 * this call target the real checkout instead of the scratch repo `cwd`
 * names, defeating this whole file's isolation claim.
 */
function git(cwd: string, args: readonly string[]): string {
  const env = { ...process.env };
  for (const name of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) {
    delete env[name];
  }
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

/** Writes a JSON file with a trailing newline. */
function writeJson(path: string, data: unknown): void {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

interface RepoOptions {
  /** Root `package.json`'s initial `version`. */
  readonly rootVersion: string;
  /** Initial `packages/<name>/package.json` versions, keyed by name. */
  readonly packages: Readonly<Record<string, string>>;
}

interface Repo {
  readonly workDir: string;
  readonly originDir: string;
  readonly initialSha: string;
}

/**
 * Creates a scratch working repo plus a bare "origin" remote, with one
 * initial commit: a root `package.json` at `rootVersion` and one
 * `packages/<name>/package.json` + `CHANGELOG.md` per `packages` entry,
 * pushed to `origin`'s `main` branch.
 */
function createRepo(options: RepoOptions): Repo {
  const base = mkdtempSync(join(tmpdir(), 'changelog-policy-'));
  scratchDirs.push(base);

  const originDir = join(base, 'origin.git');
  const workDir = join(base, 'work');
  mkdirSync(originDir);
  git(originDir, ['init', '--bare', '-b', 'main']);

  mkdirSync(workDir);
  git(workDir, ['init', '-b', 'main']);
  git(workDir, ['config', 'user.email', 'test@example.invalid']);
  git(workDir, ['config', 'user.name', 'Test']);
  git(workDir, ['config', 'commit.gpgsign', 'false']);
  git(workDir, ['config', 'tag.gpgsign', 'false']);
  git(workDir, ['remote', 'add', 'origin', originDir]);

  writeJson(join(workDir, 'package.json'), {
    name: 'root',
    version: options.rootVersion,
  });
  mkdirSync(join(workDir, 'packages'), { recursive: true });
  for (const [name, version] of Object.entries(options.packages)) {
    const dir = join(workDir, 'packages', name);
    mkdirSync(dir, { recursive: true });
    writeJson(join(dir, 'package.json'), { name, version });
    writeFileSync(join(dir, 'CHANGELOG.md'), `# ${name}\n\nInitial.\n`);
  }
  git(workDir, ['add', '-A']);
  git(workDir, ['commit', '-m', 'initial']);
  git(workDir, ['push', 'origin', 'main']);
  const initialSha = git(workDir, ['rev-parse', 'HEAD']);
  return { initialSha, originDir, workDir };
}

/**
 * Overwrites `packages/<name>/package.json`'s `version` in the working
 * tree only - the caller must still `commitAll()` separately.
 */
function bumpPackageVersion(
  workDir: string,
  name: string,
  version: string,
): void {
  const path = join(workDir, 'packages', name, 'package.json');
  writeJson(path, { name, version });
}

/** Overwrites root `package.json`'s `version`. */
function bumpRootVersion(workDir: string, version: string): void {
  writeJson(join(workDir, 'package.json'), { name: 'root', version });
}

/** Appends a line to `packages/<name>/CHANGELOG.md` (the guarded path). */
function touchChangelog(workDir: string, name: string): void {
  const path = join(workDir, 'packages', name, 'CHANGELOG.md');
  writeFileSync(path, `# ${name}\n\nInitial.\n\n## Unreleased\n\n- Change.\n`);
}

function commitAll(workDir: string, message: string): void {
  git(workDir, ['add', '-A']);
  git(workDir, ['commit', '-m', message]);
}

interface RunResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}

/**
 * Runs the real `check-changelog-policy.mjs` against `cwd`, with an
 * explicitly-built environment (never inherits `GIT_DIR`/`GIT_WORK_TREE`,
 * which would otherwise let an ambient value retarget git calls away from
 * the scratch repo).
 */
function run(
  cwd: string,
  env: Readonly<Record<string, string>> = {},
): RunResult {
  const childEnv: Record<string, string> = { PATH: process.env.PATH ?? '' };
  if (process.env.HOME) childEnv.HOME = process.env.HOME;
  Object.assign(childEnv, env);
  try {
    const stdout = execFileSync('node', [scriptPath], {
      cwd,
      encoding: 'utf8',
      env: childEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stderr: '', stdout };
  } catch (error) {
    const failure = error as { status: number; stdout: string; stderr: string };
    return {
      status: failure.status,
      stderr: failure.stderr,
      stdout: failure.stdout,
    };
  }
}

describe('check-changelog-policy', () => {
  it('passes when no package CHANGELOG.md is touched', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0' },
      rootVersion: '1.0.0',
    });
    writeFileSync(join(workDir, 'packages/alpha/README.md'), 'docs only');
    commitAll(workDir, 'docs change');

    const result = run(workDir);

    expect(result.status).toBe(0);
  });

  it('fails when a package CHANGELOG.md is touched with no version bump', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0' },
      rootVersion: '1.0.0',
    });
    touchChangelog(workDir, 'alpha');
    commitAll(workDir, 'changelog edit only');

    const result = run(workDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      '[lint:changelog] This change edits a package CHANGELOG.md',
    );
  });

  it('allows a genuine lockstep release-cut bump', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0', beta: '1.0.0' },
      rootVersion: '1.0.0',
    });
    touchChangelog(workDir, 'alpha');
    bumpRootVersion(workDir, '1.1.0');
    bumpPackageVersion(workDir, 'alpha', '1.1.0');
    bumpPackageVersion(workDir, 'beta', '1.1.0');
    commitAll(workDir, 'release cut');

    const result = run(workDir);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('bumped in lockstep');
  });

  it('rejects a CHANGELOG.md edit when only some packages bumped', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0', beta: '1.0.0' },
      rootVersion: '1.0.0',
    });
    touchChangelog(workDir, 'alpha');
    bumpRootVersion(workDir, '1.1.0');
    bumpPackageVersion(workDir, 'alpha', '1.1.0');
    // `beta` deliberately left at 1.0.0 - not a genuine lockstep bump.
    commitAll(workDir, 'partial bump');

    const result = run(workDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      '[lint:changelog] This change edits a package CHANGELOG.md',
    );
  });

  it('rejects a CHANGELOG.md edit when only root bumped', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0', beta: '1.0.0' },
      rootVersion: '1.0.0',
    });
    touchChangelog(workDir, 'alpha');
    bumpRootVersion(workDir, '1.1.0');
    // Every workspace package deliberately left at its base version -
    // not a genuine lockstep bump, even though root itself moved.
    commitAll(workDir, 'root-only bump');

    const result = run(workDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      '[lint:changelog] This change edits a package CHANGELOG.md',
    );
  });

  it('rejects a numeric downgrade even though every package "moved"', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.5.0' },
      rootVersion: '1.5.0',
    });
    touchChangelog(workDir, 'alpha');
    bumpRootVersion(workDir, '1.4.0');
    bumpPackageVersion(workDir, 'alpha', '1.4.0');
    commitAll(workDir, 'accidental downgrade');

    const result = run(workDir);

    expect(result.status).toBe(1);
  });

  it('rejects a same-value edit as a non-bump', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.5.0' },
      rootVersion: '1.5.0',
    });
    touchChangelog(workDir, 'alpha');
    // Genuinely re-write root package.json (an extra field makes this a
    // real diff entry, not a no-op `writeJson` producing byte-identical
    // content that git would record no change for at all) while keeping
    // `version` at the same value - not a genuine bump.
    writeJson(join(workDir, 'package.json'), {
      description: 'unrelated edit',
      name: 'root',
      version: '1.5.0',
    });
    commitAll(workDir, 'unrelated root edit, same version');

    const result = run(workDir);

    expect(result.status).toBe(1);
  });

  it('recognizes a prerelease-to-prerelease bump as a genuine increase', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0-alpha.10' },
      rootVersion: '1.0.0-alpha.10',
    });
    touchChangelog(workDir, 'alpha');
    bumpRootVersion(workDir, '1.0.0-alpha.11');
    bumpPackageVersion(workDir, 'alpha', '1.0.0-alpha.11');
    commitAll(workDir, 'prerelease bump');

    const result = run(workDir);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('bumped in lockstep');
  });

  it('treats a release as outranking the same core version as a prerelease', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0-alpha.5' },
      rootVersion: '1.0.0-alpha.5',
    });
    touchChangelog(workDir, 'alpha');
    bumpRootVersion(workDir, '1.0.0');
    bumpPackageVersion(workDir, 'alpha', '1.0.0');
    commitAll(workDir, 'graduate to release');

    const result = run(workDir);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('bumped in lockstep');
  });

  it('rejects a release regressing to a prerelease of the same core version', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0' },
      rootVersion: '1.0.0',
    });
    touchChangelog(workDir, 'alpha');
    bumpRootVersion(workDir, '1.0.0-alpha.1');
    bumpPackageVersion(workDir, 'alpha', '1.0.0-alpha.1');
    commitAll(workDir, 'regress to prerelease');

    const result = run(workDir);

    expect(result.status).toBe(1);
  });

  it('compares full hyphenated prerelease identifiers without truncation', () => {
    // A naive `version.split('-', 2)` truncates '1.0.0-alpha-a' to
    // ['1.0.0', 'alpha'], losing the '-a' suffix; the buggy prerelease
    // string would then tie against 'alpha-b's own truncated 'alpha' and
    // be misjudged as no bump at all. The real script preserves the whole
    // 'alpha-a' / 'alpha-b' identifiers, so this bump must be recognized.
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0-alpha-a' },
      rootVersion: '1.0.0-alpha-a',
    });
    touchChangelog(workDir, 'alpha');
    bumpRootVersion(workDir, '1.0.0-alpha-b');
    bumpPackageVersion(workDir, 'alpha', '1.0.0-alpha-b');
    commitAll(workDir, 'hyphenated prerelease bump');

    const result = run(workDir);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('bumped in lockstep');
  });

  it('allows a package newly added in the same release-cut diff', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0' },
      rootVersion: '1.0.0',
    });
    touchChangelog(workDir, 'alpha');
    bumpRootVersion(workDir, '1.1.0');
    bumpPackageVersion(workDir, 'alpha', '1.1.0');
    // `beta` has no prior version at the base commit at all.
    const betaDir = join(workDir, 'packages/beta');
    mkdirSync(betaDir, { recursive: true });
    writeJson(join(betaDir, 'package.json'), {
      name: 'beta',
      version: '1.1.0',
    });
    commitAll(workDir, 'release cut with a new package');

    const result = run(workDir);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('bumped in lockstep');
  });

  it('honors IDD_CHANGELOG_RELEASE without needing origin reachable', () => {
    const { workDir } = createRepo({
      packages: { alpha: '1.0.0' },
      rootVersion: '1.0.0',
    });
    touchChangelog(workDir, 'alpha');
    commitAll(workDir, 'manual backfill');
    git(workDir, ['remote', 'set-url', 'origin', '/nonexistent/path']);
    // Also drop the cached tracking ref: otherwise an implementation
    // that ignored IDD_CHANGELOG_RELEASE and fell back to this stale ref
    // could still exit 0 for the wrong reason, and this test would not
    // prove the override was honored.
    git(workDir, ['update-ref', '-d', 'refs/remotes/origin/main']);

    const result = run(workDir, { IDD_CHANGELOG_RELEASE: '1' });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('skipping the package CHANGELOG.md guard');
  });

  it('honors MERGE_BASE without needing origin reachable', () => {
    const { initialSha, workDir } = createRepo({
      packages: { alpha: '1.0.0' },
      rootVersion: '1.0.0',
    });
    touchChangelog(workDir, 'alpha');
    commitAll(workDir, 'changelog edit only');
    git(workDir, ['remote', 'set-url', 'origin', '/nonexistent/path']);
    // Also drop the cached tracking ref: with origin unreachable AND no
    // cached ref, an implementation that ignored MERGE_BASE would fail
    // with "Could not resolve main's current commit" instead - a
    // different message than the one asserted below - so only a genuine
    // MERGE_BASE read can produce this specific diagnostic.
    git(workDir, ['update-ref', '-d', 'refs/remotes/origin/main']);

    const result = run(workDir, { MERGE_BASE: initialSha });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      '[lint:changelog] This change edits a package CHANGELOG.md',
    );
  });

  it('fails closed when origin has a same-named tag but no main branch', () => {
    const base = mkdtempSync(join(tmpdir(), 'changelog-policy-'));
    scratchDirs.push(base);
    const originDir = join(base, 'origin.git');
    const workDir = join(base, 'work');
    mkdirSync(originDir);
    git(originDir, ['init', '--bare']);

    mkdirSync(workDir);
    git(workDir, ['init', '-b', 'trunk']);
    git(workDir, ['config', 'user.email', 'test@example.invalid']);
    git(workDir, ['config', 'user.name', 'Test']);
    git(workDir, ['config', 'commit.gpgsign', 'false']);
    git(workDir, ['config', 'tag.gpgsign', 'false']);
    git(workDir, ['remote', 'add', 'origin', originDir]);
    writeJson(join(workDir, 'package.json'), {
      name: 'root',
      version: '1.0.0',
    });
    mkdirSync(join(workDir, 'packages/alpha'), { recursive: true });
    writeJson(join(workDir, 'packages/alpha/package.json'), {
      name: 'alpha',
      version: '1.0.0',
    });
    writeFileSync(join(workDir, 'packages/alpha/CHANGELOG.md'), '# alpha\n');
    git(workDir, ['add', '-A']);
    git(workDir, ['commit', '-m', 'initial']);
    git(workDir, ['push', 'origin', 'trunk']);
    // A tag literally named "main", never a refs/heads/main branch.
    git(workDir, ['tag', 'main']);
    git(workDir, ['push', 'origin', 'refs/tags/main']);

    touchChangelog(workDir, 'alpha');
    commitAll(workDir, 'changelog edit only');

    const result = run(workDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "[lint:changelog] Could not resolve main's current commit",
    );
  });
});
