import { existsSync as concretedExistsSync } from 'node:fs';
import { mkdir as concretedMkdir } from 'node:fs/promises';
import { execa as concretedExeca } from 'execa';
import type { BuildTasksOptions } from '../listr2/createBuildTasks.mjs';
import type { NormalizedCacheOptions } from './normalizeCacheOptions.mjs';
import { normalizeCacheOptions } from './normalizeCacheOptions.mjs';

/** Type definition for options accepted by {@link createBuildTasks}. */
export interface NormalizedBuildOptions extends NormalizedCacheOptions {
  /** Output file base name. */
  readonly basename: string;

  /** `execa` implementation. */
  readonly execa: typeof concretedExeca;
}

/**
 * Normalize build options for use in tasks.
 * @param options Options to normalize.
 * @returns Normalized build options.
 */
export const normalizeBuildOptions = async (
  options: BuildTasksOptions,
): Promise<NormalizedBuildOptions> => {
  const { basename, execa = concretedExeca, ...cacheOpts } = options;
  const normalized = normalizeCacheOptions({
    arch: cacheOpts.arch,
    download: cacheOpts.download,
    existsSync: cacheOpts.existsSync ?? concretedExistsSync,
    mkdir: cacheOpts.mkdir ?? concretedMkdir,
    nodeVersion: cacheOpts.nodeVersion,
    platform: cacheOpts.platform,
    projectRoot: cacheOpts.projectRoot,
    targets: cacheOpts.targets,
  });
  return { ...normalized, basename, execa };
};
