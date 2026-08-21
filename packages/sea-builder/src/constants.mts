import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * Default cache directory used to store Node.js archives.
 *
 * This must match `xsea`'s own hard-coded cache lookup exactly
 * (`xsea@0.1.3`, `dist/cli.js:23`: `join(homedir(), '.cache/xsea')`) —
 * `xsea` has no flag or environment variable to redirect it, so an
 * archive downloaded anywhere else is never actually read when `xsea`
 * builds the SEA binary (see issue #156).
 */
export const CACHE_DIR = join(homedir(), '.cache/xsea');

/**
 * Common prefix arguments passed to the `xsea` CLI.
 * These arguments point to the build output entry file and specify
 * the output location for the resulting SEA binary.
 */
export const XSEA_PREFIX_ARGS = [
  'exec',
  'xsea',
  'dist/index.mjs',
  '-o',
] as const;
