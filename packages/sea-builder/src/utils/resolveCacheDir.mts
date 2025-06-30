import { join } from 'node:path';
import { CACHE_DIR } from '../constants.mjs';
import { findProjectRoot } from './findProjectRoot.mjs';
import type { ExistsSync } from './types.mjs';

/**
 * Resolve the cache directory path.
 * @param cwd Current working directory.
 * @param existsSync Implementation of {@link ExistsSync}.
 * @param projectRoot Optional project root. When omitted it will be detected.
 * @returns Path to the cache directory.
 */
export const resolveCacheDir = (
  cwd: string,
  existsSync: ExistsSync,
  projectRoot?: string | undefined,
): string => join(projectRoot ?? findProjectRoot(cwd, existsSync), CACHE_DIR);
