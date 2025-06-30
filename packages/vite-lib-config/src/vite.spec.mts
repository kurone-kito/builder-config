import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { viteConfig } from './vite.mjs';

const srcDir = 'src';

/**
 * Sets up a temporary directory with Vite entry files.
 * @param files Mapping of file name to contents to create under {@link srcDir}.
 * @returns The created directory path.
 */
const setup = async (files: Record<string, string>) => {
  const dir = await mkdtemp(join(tmpdir(), 'vite-config-'));
  await mkdir(join(dir, srcDir), { recursive: true });
  await Promise.all(
    Object.entries(files).map(([name, text]) =>
      writeFile(join(dir, srcDir, name), text),
    ),
  );
  return dir;
};

describe('viteConfig', () => {
  let cwd: string;
  let entry: string | string[];
  describe('When detects shebang', () => {
    beforeAll(async () => {
      cwd = await setup({ 'index.mts': '#!/usr/bin/env node\nconsole.log();' });
      entry = join(cwd, srcDir, 'index.mts');
    });

    afterAll(async () => {
      await rm(cwd, { recursive: true, force: true });
      cwd = '';
    });

    it('should disable library mode', () =>
      expect(viteConfig({}, { cwd })).not.toHaveProperty('build.lib'));

    it('overrides settings with mergeConfig', () =>
      expect(viteConfig({ build: { outDir: 'out' } }, { cwd })).toHaveProperty(
        'build.outDir',
        'out',
      ));

    it('disables type definition generation', () =>
      expect(viteConfig({}, { cwd })).toHaveProperty('plugins', []));
  });

  describe('When does not detect shebang', () => {
    beforeAll(async () => {
      cwd = await setup({ 'index.mts': 'console.log();' });
      entry = join(cwd, srcDir, 'index.mts');
    });

    afterAll(async () => {
      await rm(cwd, { recursive: true, force: true });
      cwd = '';
    });

    it('should enable library mode', () =>
      expect(viteConfig({}, { cwd })).toHaveProperty('build.lib', {
        entry: [entry],
        formats: ['es'],
      }));

    it('overrides settings with mergeConfig', () =>
      expect(viteConfig({ build: { outDir: 'out' } }, { cwd })).toHaveProperty(
        'build.outDir',
        'out',
      ));

    it('enables type definition generation', () =>
      expect(viteConfig({}, { cwd })).toHaveProperty('plugins', [
        expect.anything(),
      ]));
  });

  describe('When specifying multiple entries', () => {
    describe('and all entries have shebang', () => {
      beforeAll(async () => {
        cwd = await setup({
          'index.mts': '#!/usr/bin/env node\n',
          'cli.mts': '#!/usr/bin/env node\n',
        });
        entry = [join(cwd, srcDir, 'index.mts'), join(cwd, srcDir, 'cli.mts')];
      });

      afterAll(async () => {
        await rm(cwd, { recursive: true, force: true });
        cwd = '';
      });

      it('should disable library mode', () =>
        expect(
          viteConfig({}, { cwd, entries: ['index.mts', 'cli.mts'] }),
        ).not.toHaveProperty('build.lib'));
    });

    describe('and at least one entry has no shebang', () => {
      beforeAll(async () => {
        cwd = await setup({
          'index.mts': 'console.log();',
          'cli.mts': '#!/usr/bin/env node\n',
        });
        entry = [join(cwd, srcDir, 'index.mts'), join(cwd, srcDir, 'cli.mts')];
      });

      afterAll(async () => {
        await rm(cwd, { recursive: true, force: true });
        cwd = '';
      });

      it('should enable library mode', () =>
        expect(
          viteConfig({}, { cwd, entries: ['index.mts', 'cli.mts'] }),
        ).toHaveProperty('build.lib', {
          entry,
          formats: ['es'],
        }));
    });
  });

  describe('When the entry does not exist', () => {
    beforeAll(async () => {
      cwd = await mkdtemp(join(tmpdir(), 'vite-config-')); // no file creation
    });

    afterAll(async () => {
      await rm(cwd, { recursive: true, force: true });
      cwd = '';
    });

    it('returns an empty configuration', () =>
      expect(viteConfig({}, { cwd, entries: ['index.mts'] })).toEqual({}));
  });
});

describe('srcDir', () => {
  it('exports srcDir constant', () => expect(srcDir).toBe('src'));
});
