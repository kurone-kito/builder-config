import type { Listr } from 'listr2';
import type { DownloadFunction, ExistsSync, Mkdir } from '../utils/types.mjs';
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

  /** Project root directory path. If not provided, will be auto-detected. */
  readonly projectRoot?: string | undefined;

  /** Target strings such as `linux-x64`. */
  readonly targets?: readonly string[] | undefined;
}

/**
 * Create Listr tasks for downloading Node.js archives.
 * @param options Options controlling the task generation.
 * @returns Configured {@link Listr} instance.
 */
export const createCacheTasks = (options: CacheOptions = {}): Task[] => {
  const { cacheDir, download, existsSync, mkdir, nodeVersion, targets } =
    normalizeCacheOptions(options);
  const metaFor = createMetaFactory(cacheDir, nodeVersion);
  const toTask = createTaskFactory(download, existsSync, mkdir, cacheDir);
  return targets.map((t) => toTask(metaFor(t)));
};
