import { existsSync as concretedExistsSync } from 'node:fs';
import { mkdir as concretedMkdir } from 'node:fs/promises';
import type { SetNonNullable } from 'type-fest';
import { CACHE_DIR } from '../constants.mjs';
import { downloadArchive } from '../utils/downloadArchive.mjs';
import { normalizeTargets } from '../utils/normalizeTargets.mjs';
import type { CacheOptions } from './createCacheTasks.mjs';

/** Type definition for options accepted by {@link normalizeCacheOptions}. */
export interface NormalizedCacheOptions
  extends SetNonNullable<Required<CacheOptions>> {
  /** Directory path where Node.js archives are cached. */
  readonly cacheDir: string;
}

/**
 * Normalize cache options for use in tasks.
 * @param options Options to normalize.
 * @returns Normalized cache options.
 */
export const normalizeCacheOptions = (
  options: CacheOptions,
): NormalizedCacheOptions => {
  const {
    arch = process.arch,
    download = downloadArchive,
    existsSync = concretedExistsSync,
    mkdir = concretedMkdir,
    nodeVersion = `v${process.versions.node}`,
    platform = process.platform,
    targets = [],
  } = options;
  return {
    cacheDir: CACHE_DIR,
    arch,
    platform,
    nodeVersion,
    targets: normalizeTargets(targets, platform, arch),
    download,
    existsSync,
    mkdir,
  };
};
