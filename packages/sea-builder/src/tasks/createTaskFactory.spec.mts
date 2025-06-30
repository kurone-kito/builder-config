import { describe, expect, it, vi } from 'vitest';
import type { ArchiveMeta } from './createMetaFactory.mjs';
import { createTaskFactory } from './createTaskFactory.mjs';

describe('createTaskFactory', () => {
  const meta: ArchiveMeta = {
    archivePath: '/cache/node.tar.gz',
    target: 'linux-x64',
    url: 'https://example.com/node.tar.gz',
  };

  it('downloads archive when missing', async () => {
    const download = vi.fn();
    const existsSync = vi.fn(() => false);
    const mkdir = vi.fn(async () => undefined);
    const factory = createTaskFactory(download, existsSync, mkdir, '/cache');
    await factory(meta).task();
    expect(mkdir).toHaveBeenCalledWith('/cache', { recursive: true });
    expect(download).toHaveBeenCalledWith(meta.url, meta.archivePath);
  });

  it('skips download when archive exists', async () => {
    const download = vi.fn();
    const existsSync = vi.fn(() => true);
    const mkdir = vi.fn(async () => undefined);
    const factory = createTaskFactory(download, existsSync, mkdir, '/cache');
    await factory(meta).task();
    expect(download).not.toHaveBeenCalled();
  });

  it('sets task title to target', () => {
    const factory = createTaskFactory(
      vi.fn(),
      vi.fn(() => true),
      vi.fn(async () => undefined),
      '/cache',
    );
    expect(factory(meta).title).toBe('linux-x64');
  });
});
