import { describe, expect, it, vi } from 'vitest';
import { createCacheTask } from './createCacheTask.mjs';

const opts = {
  download: vi.fn(),
  existsSync: vi.fn(() => true),
  mkdir: vi.fn(async () => undefined),
};

describe('createCacheTask', () => {
  it('runs createListrCacheTasks', async () => {
    await createCacheTask(opts).task();
    expect(opts.download).not.toHaveBeenCalled();
  });

  it('sets title', () =>
    expect(createCacheTask(opts).title).toBe('Download the Node.js archives'));

  it('includes the resolved Node.js version in the title when provided', () =>
    expect(createCacheTask({ ...opts, nodeVersion: 'v22.23.2' }).title).toBe(
      'Download the Node.js archives (v22.23.2)',
    ));
});
