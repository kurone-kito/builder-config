#!/usr/bin/env node --enable-source-maps

import { createListrCacheTasks } from './listr2/createCacheTasks.mjs';
import { runIfMain } from './utils/runIfMain.mjs';

/**
 * Main function to create and run cache tasks.
 * @param targets The targets to cache, which can be Node.js versions or other identifiers.
 * @returns A promise that resolves when the tasks are completed.
 */
export const main = async (...targets: readonly string[]): Promise<void> =>
  createListrCacheTasks({ targets }).run();

runIfMain(import.meta.url, main);
