import { afterEach, describe, expect, it, vi } from 'vitest';
import { main } from './cache.mjs';

const mocks = vi.hoisted(() => {
  return {
    createListrCacheTasks: vi.fn().mockReturnValue({ run: vi.fn() }),
  };
});

vi.mock('./listr2/createCacheTasks.mjs', () => {
  return {
    createListrCacheTasks: mocks.createListrCacheTasks,
  };
});

describe('main', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createListrCacheTasks が呼び出されること', async () => {
    await main('target1', 'target2');
    expect(mocks.createListrCacheTasks).toHaveBeenCalledWith({
      targets: ['target1', 'target2'],
    });
  });

  it('createListrCacheTasks が返すタスクの run メソッドが呼び出されること', async () => {
    const run = vi.fn();
    mocks.createListrCacheTasks.mockReturnValue({ run });
    await main();
    expect(run).toHaveBeenCalled();
  });
});
