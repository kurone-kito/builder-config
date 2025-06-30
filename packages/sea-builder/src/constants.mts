import { join } from 'node:path';

/** Default cache directory used to store Node.js archives. */
export const CACHE_DIR = join('node_modules', '.cache', 'xsea');

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
