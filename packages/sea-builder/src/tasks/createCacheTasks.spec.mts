import { describe, expect, it, vi } from 'vitest';
import { CACHE_DIR } from '../constants.mjs';
import { createCacheTasks } from './createCacheTasks.mjs';

const nodeVersion = 'v18.0.0';

describe('createCacheTasks', () => {
  it('creates tasks for each target', () => {
    const tasks = createCacheTasks({
      download: vi.fn(),
      existsSync: () => false,
      mkdir: vi.fn(async () => undefined),
      nodeVersion,
      projectRoot: '/prj',
      targets: ['linux-x64', 'win32-x64'],
    });
    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.title).toBe('linux-x64');
    expect(tasks[1]?.title).toBe('win32-x64');
  });

  it('passes correct metadata to download', async () => {
    const downloads: Array<readonly [string, string]> = [];
    const tasks = createCacheTasks({
      download: async (url, dest) => {
        downloads.push([url, dest]);
      },
      existsSync: () => false,
      mkdir: vi.fn(async () => undefined),
      nodeVersion,
      projectRoot: '/prj',
      targets: ['linux-x64'],
    });
    await tasks[0]?.task();
    expect(downloads[0]?.[0]).toContain(nodeVersion);
    expect(downloads[0]?.[1]).toContain(CACHE_DIR);
  });
});
