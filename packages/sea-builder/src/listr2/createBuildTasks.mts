import type { execa as concretedExeca } from 'execa';
import { Listr } from 'listr2';
import { createBuildTask } from '../tasks/createBuildTask.mjs';
import { createCacheTask } from '../tasks/createCacheTask.mjs';
import type { CacheOptions } from '../tasks/createCacheTasks.mjs';
import { createSeaTask } from '../tasks/createSeaTask.mjs';
import { normalizeBuildOptions } from '../tasks/normalizeBuildOptions.mjs';
import { resolveNodeVersion } from '../utils/resolveNodeVersion.mjs';

/** Options accepted by {@link createBuildTasks}. */
export interface BuildTasksOptions extends CacheOptions {
  /** `execa` implementation. */
  readonly execa?: typeof concretedExeca | undefined;

  /** Output file base name. */
  readonly basename: string;
}

/**
 * Execute SEA build process.
 *
 * This function runs a series of tasks to build the project, download
 * required Node.js archives and finally generate the SEA binary.
 * @param options Options controlling the build behaviour.
 */
export const createBuildTasks = async (
  options: BuildTasksOptions,
): Promise<Listr> => {
  const { arch, platform = process.platform, projectRoot } = options;
  const { basename, download, execa, existsSync, mkdir, nodeVersion, targets } =
    await normalizeBuildOptions(options);
  return new Listr([
    createBuildTask(execa),
    createCacheTask({
      arch,
      download,
      existsSync,
      mkdir,
      nodeVersion: await resolveNodeVersion(nodeVersion),
      platform,
      projectRoot,
      targets,
    }),
    createSeaTask(execa, targets, basename),
  ]);
};
