import { createListrCacheTasks } from '../listr2/createCacheTasks.mjs';
import type { CacheOptions } from './createCacheTasks.mjs';
import type { Task } from './createTaskFactory.mjs';

/**
 * Create a Listr task for caching Node.js archives.
 * @param opts Options for cache creation including targets.
 * @returns Listr task object.
 */
export const createCacheTask = (opts: CacheOptions): Task => ({
  title: 'Download the Node.js archives',
  task: () => createListrCacheTasks(opts).run(),
});
