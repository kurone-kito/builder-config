import { existsSync, mkdirSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { findProjectRoot } from './findProjectRoot.mjs';

let root: string;
let sub: string;

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'fpr-'));
  sub = join(root, 'a/b/c');
  mkdirSync(sub, { recursive: true });
});

afterAll(() => rm(root, { recursive: true, force: true }));

describe('findProjectRoot', () => {
  it('returns path with package.json', async () => {
    await writeFile(join(root, 'package.json'), '{}');
    expect(findProjectRoot(sub, existsSync)).toBe(root);
  });

  it('falls back to start when none found', () => {
    expect(findProjectRoot(sub, () => false)).toBe(sub);
  });
});
