#!/usr/bin/env node --enable-source-maps

import { detectImportWithError } from '@kurone-kito/web-toybox-node';
import { createListrCacheTasks } from './listr2/createCacheTasks.mjs';

detectImportWithError(import.meta.url);

await createListrCacheTasks({ targets: process.argv.slice(2) }).run();
