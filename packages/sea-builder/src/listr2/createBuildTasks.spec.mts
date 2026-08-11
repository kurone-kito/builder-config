import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBuildTasks } from './createBuildTasks.mjs';

const mocks = vi.hoisted(() => ({
  createBuildTask: vi.fn(() => ({ task: vi.fn(), title: 'Build' })),
  createCacheTask: vi.fn(() => ({ task: vi.fn(), title: 'Cache' })),
  createSeaTask: vi.fn(() => ({ task: vi.fn(), title: 'Sea' })),
  normalizeBuildOptions: vi.fn(),
  resolveNodeVersion: vi.fn(),
}));

vi.mock('../tasks/createBuildTask.mjs', () => ({
  createBuildTask: mocks.createBuildTask,
}));

vi.mock('../tasks/createCacheTask.mjs', () => ({
  createCacheTask: mocks.createCacheTask,
}));

vi.mock('../tasks/createSeaTask.mjs', () => ({
  createSeaTask: mocks.createSeaTask,
}));

vi.mock('../tasks/normalizeBuildOptions.mjs', () => ({
  normalizeBuildOptions: mocks.normalizeBuildOptions,
}));

vi.mock('../utils/resolveNodeVersion.mjs', () => ({
  resolveNodeVersion: mocks.resolveNodeVersion,
}));

describe('createBuildTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.normalizeBuildOptions.mockResolvedValue({
      basename: 'foo',
      download: vi.fn(),
      execa: vi.fn(),
      existsSync: vi.fn(),
      mkdir: vi.fn(),
      // A pre-defaulted value, distinct from the raw option, so a
      // regression that resolves this instead of the raw option is
      // caught by the assertions below.
      nodeVersion: 'v20.19.5',
      targets: ['linux-x64'],
    });
    mocks.resolveNodeVersion.mockResolvedValue('v22.23.2');
  });

  it('resolves the node version from the raw option, not the pre-defaulted one', async () => {
    await createBuildTasks({ basename: 'foo' });
    expect(mocks.resolveNodeVersion).toHaveBeenCalledWith(undefined);
  });

  it('passes an explicit --node spec through untouched', async () => {
    await createBuildTasks({ basename: 'foo', nodeVersion: '20' });
    expect(mocks.resolveNodeVersion).toHaveBeenCalledWith('20');
  });

  it('passes the resolved node version to createCacheTask', async () => {
    await createBuildTasks({ basename: 'foo' });
    expect(mocks.createCacheTask).toHaveBeenCalledWith(
      expect.objectContaining({ nodeVersion: 'v22.23.2' }),
    );
  });
});
