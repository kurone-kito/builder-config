#!/usr/bin/env node --enable-source-maps

import { isNativeError } from 'node:util/types';
import { detectImportWithError } from '@kurone-kito/web-toybox-node';
import { createBuildTasks } from './listr2/createBuildTasks.mjs';
import { parseArgs } from './utils/parseArgs.mjs';
import { usage } from './utils/usage.mjs';

detectImportWithError(import.meta.url);

try {
  const args = parseArgs(process.argv.slice(2));
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
