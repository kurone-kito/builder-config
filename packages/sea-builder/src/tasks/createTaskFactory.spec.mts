import { describe, expect, it, vi } from 'vitest';
import type { ArchiveMeta } from './createMetaFactory.mjs';
import { createTaskFactory } from './createTaskFactory.mjs';

describe('createTaskFactory', () => {
  const meta: ArchiveMeta = {
    archivePath: '/cache/node.tar.gz',
    target: 'linux-x64',
    url: 'https://example.com/node.tar.gz',
  };

  it('downloads archive when missing, without verifying a cache hit', async () => {
    const download = vi.fn();
    const verifyCachedArchive = vi.fn();
    const existsSync = vi.fn(() => false);
    const mkdir = vi.fn(async () => undefined);
    const factory = createTaskFactory(
      download,
      verifyCachedArchive,
      existsSync,
      mkdir,
      '/cache',
    );
    await factory(meta).task();
    expect(mkdir).toHaveBeenCalledWith('/cache', { recursive: true });
    expect(verifyCachedArchive).not.toHaveBeenCalled();
    expect(download).toHaveBeenCalledWith(meta.url, meta.archivePath);
  });

  it('skips download on a cache hit with a matching checksum', async () => {
    const download = vi.fn();
    const verifyCachedArchive = vi.fn(async () => true);
    const existsSync = vi.fn(() => true);
    const mkdir = vi.fn(async () => undefined);
    const factory = createTaskFactory(
      download,
      verifyCachedArchive,
      existsSync,
      mkdir,
      '/cache',
    );
    await factory(meta).task();
    expect(verifyCachedArchive).toHaveBeenCalledWith(
      meta.url,
      meta.archivePath,
    );
    expect(download).not.toHaveBeenCalled();
  });

  it('downloads when a cache hit fails checksum re-verification', async () => {
    const download = vi.fn();
    const verifyCachedArchive = vi.fn(async () => false);
    const existsSync = vi.fn(() => true);
    const mkdir = vi.fn(async () => undefined);
    const factory = createTaskFactory(
      download,
      verifyCachedArchive,
      existsSync,
      mkdir,
      '/cache',
    );
    await factory(meta).task();
    expect(verifyCachedArchive).toHaveBeenCalledWith(
      meta.url,
      meta.archivePath,
    );
    expect(download).toHaveBeenCalledWith(meta.url, meta.archivePath);
  });

  it('sets task title to target', () => {
    const factory = createTaskFactory(
      vi.fn(),
      vi.fn(async () => true),
      vi.fn(() => true),
      vi.fn(async () => undefined),
      '/cache',
    );
    expect(factory(meta).title).toBe('linux-x64');
  });
});
