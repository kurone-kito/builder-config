#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

// pnpm's global virtual store breaks typedoc's own bare-specifier plugin lookup; resolve it here instead.
const pluginPath = require.resolve('typedoc-plugin-markdown');
const typedocBin = join(
  dirname(require.resolve('typedoc/package.json')),
  'bin/typedoc',
);
const { status } = spawnSync(
  process.execPath,
  [typedocBin, '--plugin', pluginPath],
  {
    stdio: 'inherit',
  },
);
process.exit(status ?? 1);
