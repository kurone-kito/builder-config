#!/usr/bin/env node

import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, bin, src, dest] = process.argv;
if (fileURLToPath(import.meta.url) !== realpathSync(bin)) {
  throw new Error('This script cannot be imported.');
}
const [firstLine] = readFileSync(src, 'utf8').split(/\r?\n/);
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, `${firstLine}\n`);
