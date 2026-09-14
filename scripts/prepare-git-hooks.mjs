#!/usr/bin/env node

/**
 * Points `core.hooksPath` at this repository's `.githooks/` directory.
 *
 * Runs as the npm `prepare` lifecycle script. A plain shell one-liner
 * (`git rev-parse --git-dir >/dev/null 2>&1 || exit 0; git config
 * core.hooksPath .githooks`) is not portable here: pnpm >=12's built-in
 * cross-platform shell emulator rejects a command with more than one
 * redirect (`ERR_PNPM_EXECUTOR_SHELL_EMULATOR_PARSE`). A Node script
 * sidesteps the emulator entirely and works identically on every OS and
 * package-manager version.
 *
 * No-ops when not run inside a git working tree - for example, from an
 * installed package's own `node_modules` copy, where `.git` does not
 * exist.
 */

import { execFileSync } from 'node:child_process';

try {
  execFileSync('git', ['rev-parse', '--git-dir'], { stdio: 'ignore' });
} catch {
  process.exit(0);
}

execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
  stdio: 'inherit',
});
