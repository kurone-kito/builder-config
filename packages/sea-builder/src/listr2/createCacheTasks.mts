import { Listr } from 'listr2';
import type { CacheOptions } from '../tasks/createCacheTasks.mjs';
import { createCacheTasks } from '../tasks/createCacheTasks.mjs';

/**
 * Create Listr tasks for downloading Node.js archives.
 * @param options Options controlling the task generation.
 * @returns Configured {@link Listr} instance.
 */
export const createListrCacheTasks = (options: CacheOptions = {}): Listr =>
  new Listr(createCacheTasks(options), { concurrent: true });
