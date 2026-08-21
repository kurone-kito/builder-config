import { resolveNodeVersion } from '../utils/resolveNodeVersion.mjs';
import type {
  DownloadFunction,
  ExistsSync,
  Mkdir,
  VerifyCachedArchiveFunction,
} from '../utils/types.mjs';
import { createMetaFactory } from './createMetaFactory.mjs';
import type { Task } from './createTaskFactory.mjs';
import { createTaskFactory } from './createTaskFactory.mjs';
import { normalizeCacheOptions } from './normalizeCacheOptions.mjs';

/** Options accepted by {@link cache} and {@link createCacheTasks}. */
export interface CacheOptions {
  /** Architecture identifier. */
  readonly arch?: string | undefined;

  /** File download function used to fetch archives. */
  readonly download?: DownloadFunction | undefined;

  /** `fs.existsSync` implementation. */
  readonly existsSync?: ExistsSync | undefined;

  /** `fs.mkdir` implementation. */
  readonly mkdir?: Mkdir | undefined;

  /** Node.js version string. */
  readonly nodeVersion?: string | undefined;

  /** Platform identifier. */
  readonly platform?: NodeJS.Platform | undefined;

  /** Target strings such as `linux-x64`. */
  readonly targets?: readonly string[] | undefined;

  /**
   * Function that re-verifies an existing cache-hit archive against its
   * published checksum.
   */
  readonly verifyCachedArchive?: VerifyCachedArchiveFunction | undefined;
}

/**
 * Create Listr tasks for downloading Node.js archives.
 *
 * Resolves an omitted or spec-only `nodeVersion` the same way
 * {@link createBuildTasks} does, so `sea-cache` and `sea-builder` agree on
 * which archive to fetch when neither specifies an explicit version.
 * @param options Options controlling the task generation.
 * @returns A promise that resolves to the configured cache tasks.
 */
export const createCacheTasks = async (
  options: CacheOptions = {},
): Promise<Task[]> => {
  const {
    cacheDir,
    download,
    existsSync,
    mkdir,
    nodeVersion,
    targets,
    verifyCachedArchive,
  } = normalizeCacheOptions({
    ...options,
    nodeVersion: await resolveNodeVersion(options.nodeVersion),
  });
  const metaFor = createMetaFactory(cacheDir, nodeVersion);
  const toTask = createTaskFactory(
    download,
    verifyCachedArchive,
    existsSync,
    mkdir,
    cacheDir,
  );
  return targets.map((t) => toTask(metaFor(t)));
};
