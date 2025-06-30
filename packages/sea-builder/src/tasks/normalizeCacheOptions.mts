import { existsSync as concretedExistsSync } from 'node:fs';
import { mkdir as concretedMkdir } from 'node:fs/promises';
import type { Except, SetNonNullable } from 'type-fest';
import { downloadArchive } from '../utils/downloadArchive.mjs';
import { normalizeTargets } from '../utils/normalizeTargets.mjs';
import { resolveCacheDir } from '../utils/resolveCacheDir.mjs';
import type { CacheOptions } from './createCacheTasks.mjs';

/** Type definition for options accepted by {@link normalizeCacheOptions}. */
export interface NormalizedCacheOptions
  extends Except<SetNonNullable<Required<CacheOptions>>, 'projectRoot'> {
  /** Directory path where Node.js archives are cached. */
  readonly cacheDir: string;
}

/**
 * Normalize cache options for use in tasks.
 * @param options Options to normalize.
 * @param cwd Current working directory. Defaults to `process.cwd()`.
 * @returns Normalized cache options.
 */
export const normalizeCacheOptions = (
  options: CacheOptions,
  cwd: string = process.cwd(),
): NormalizedCacheOptions => {
  const {
    arch = process.arch,
    download = downloadArchive,
    existsSync = concretedExistsSync,
    mkdir = concretedMkdir,
    nodeVersion = `v${process.versions.node}`,
    platform = process.platform,
    projectRoot,
    targets = [],
  } = options;
  return {
    cacheDir: resolveCacheDir(cwd, existsSync, projectRoot),
    arch,
    platform,
    nodeVersion,
    targets: normalizeTargets(targets, platform, arch),
    download,
    existsSync,
    mkdir,
  };
};
