import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { vitestConfig } from './vitest.mjs';

const srcDir = 'src';

/**
 * Sets up a temporary directory with Vite entry files.
 * @param files Mapping of file name to contents to create under {@link srcDir}.
 * @returns The created directory path.
 */
const setup = async (files: Record<string, string>) => {
  const dir = await mkdtemp(join(tmpdir(), 'vitest-config-'));
  await mkdir(join(dir, srcDir), { recursive: true });
  await Promise.all(
    Object.entries(files).map(([name, text]) =>
      writeFile(join(dir, srcDir, name), text),
    ),
  );
  return dir;
};

describe('vitestConfig', () => {
  let cwd: string;
  let entry: string;

  beforeAll(async () => {
    cwd = await setup({ 'index.mts': 'console.log();' });
    entry = join(cwd, srcDir, 'index.mts');
  });

  afterAll(async () => {
    await rm(cwd, { recursive: true, force: true });
    cwd = '';
  });

  it('merges viteConfig settings', () =>
    expect(vitestConfig({}, { cwd })).toHaveProperty('build.lib', {
      entry: [entry],
      formats: ['es'],
    }));

  it('adds test environment default', () =>
    expect(vitestConfig({}, { cwd })).toHaveProperty(
      'test.environment',
      'node',
    ));

  it('overrides settings with mergeConfig', () =>
    expect(vitestConfig({ build: { outDir: 'out' } }, { cwd })).toHaveProperty(
      'build.outDir',
      'out',
    ));

  it('allows overriding the test environment', () =>
    expect(
      vitestConfig({ test: { environment: 'jsdom' } }, { cwd }),
    ).toHaveProperty('test.environment', 'jsdom'));
});

describe('srcDir', () => {
  it('exports srcDir constant', () => expect(srcDir).toBe('src'));
});
