import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('CLI outputs Hello, world!', () => {
  const stdout = execFileSync(
    'node',
    [resolve(import.meta.dirname, '../dist/index.mjs')],
    { encoding: 'utf8' },
  );
  expect(stdout.trim()).toBe('Hello, world!');
});
