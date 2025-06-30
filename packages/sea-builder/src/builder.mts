#!/usr/bin/env node --enable-source-maps

import { isNativeError } from 'node:util/types';
import { createBuildTasks } from './listr2/createBuildTasks.mjs';
import { parseArgs } from './utils/parseArgs.mjs';
import { runIfMain } from './utils/runIfMain.mjs';
import { usage } from './utils/usage.mjs';

/**
 * Main function to create and run build tasks.
 * @param rawArgs The raw command line arguments passed to the script.
 */
export const main = async (...rawArgs: readonly string[]): Promise<void> => {
  try {
    const args = parseArgs(rawArgs);
    if (args.help) {
      usage();
    } else {
      await (await createBuildTasks(args)).run();
    }
  } catch (err) {
    if (isNativeError(err)) {
      console.error(err.message);
    }
    process.exitCode = 1;
  }
};

runIfMain(import.meta.url, main);
