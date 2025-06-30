import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', () => ({ realpathSync: (p: string) => p }));

const { runIfMain } = await import('./runIfMain.mjs');

describe('runIfMain', () => {
  const originalArgv = process.argv.slice();

  afterEach(() => {
    process.argv = originalArgv.slice();
  });

  it('executes when script is entry', async () => {
    process.argv = ['node', '/entry.mjs', 'a'];
    const mockFn = vi.fn();
    await runIfMain('file:///entry.mjs', mockFn);
    expect(mockFn).toHaveBeenCalledWith('a');
  });

  it('skips when not entry', async () => {
    process.argv = ['node', '/other.mjs'];
    const mockFn = vi.fn();
    await runIfMain('file:///entry.mjs', mockFn);
    expect(mockFn).not.toHaveBeenCalled();
  });
});
