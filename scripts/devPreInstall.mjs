#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const bin = join(dist, process.argv[2] ?? 'bin.mjs');

if (!existsSync(bin)) {
  mkdirSync(dist, { recursive: true });
  writeFileSync(bin, '#!/usr/bin/env node\n', { mode: 0o755 });
}
