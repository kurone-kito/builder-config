import { Listr } from 'listr2';
import type { CacheOptions } from '../tasks/createCacheTasks.mjs';
import { createCacheTasks } from '../tasks/createCacheTasks.mjs';

/**
 * Create Listr tasks for downloading Node.js archives.
 * @param options Options controlling the task generation.
 * @returns A promise that resolves to the configured {@link Listr} instance.
 */
export const createListrCacheTasks = async (
  options: CacheOptions = {},
): Promise<Listr> =>
  new Listr(await createCacheTasks(options), { concurrent: true });
