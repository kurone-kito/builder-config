import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createCacheTasks } from './createCacheTasks.mjs';

const nodeVersion = 'v18.0.0';
// The exact directory `xsea@0.1.3` itself hard-codes (`dist/cli.js:23`).
const expectedCacheDir = join(homedir(), '.cache/xsea');

describe('createCacheTasks', () => {
  it('creates tasks for each target', async () => {
    const tasks = await createCacheTasks({
      download: vi.fn(),
      existsSync: () => false,
      mkdir: vi.fn(async () => undefined),
      nodeVersion,
      targets: ['linux-x64', 'win32-x64'],
    });
    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.title).toBe('linux-x64');
    expect(tasks[1]?.title).toBe('win-x64');
  });

  it('downloads into the xsea-compatible home cache directory', async () => {
    const downloads: Array<readonly [string, string]> = [];
    const tasks = await createCacheTasks({
      download: async (url, dest) => {
        downloads.push([url, dest]);
      },
      existsSync: () => false,
      mkdir: vi.fn(async () => undefined),
      nodeVersion,
      targets: ['linux-x64'],
    });
    await tasks[0]?.task();
    expect(downloads[0]?.[0]).toContain(nodeVersion);
    // Asserted with startsWith rather than "contains CACHE_DIR", which
    // would also have passed for the old, wrong, project-relative path.
    expect(downloads[0]?.[1]?.startsWith(expectedCacheDir)).toBe(true);
  });
});
