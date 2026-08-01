#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// pnpm's global virtual store breaks typedoc's own bare-specifier plugin lookup; resolve it here instead.
const pluginPath = require.resolve('typedoc-plugin-markdown');
const { status } = spawnSync('typedoc', ['--plugin', pluginPath], {
  shell: true,
  stdio: 'inherit',
});
process.exit(status ?? 1);
