import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', () => ({ realpathSync: (p: string) => p }));

const { runIfMain } = await import('./runIfMain.mjs');

const entryPath = process.platform === 'win32' ? 'C:\\entry.mjs' : '/entry.mjs';
const otherPath = process.platform === 'win32' ? 'C:\\other.mjs' : '/other.mjs';
const entryUrl = pathToFileURL(entryPath).toString();

describe('runIfMain', () => {
  const originalArgv = process.argv.slice();

  afterEach(() => {
    process.argv = originalArgv.slice();
  });

  it('executes when script is entry', async () => {
    process.argv = ['node', entryPath, 'a'];
    const mockFn = vi.fn();
    await runIfMain(entryUrl, mockFn);
    expect(mockFn).toHaveBeenCalledWith('a');
  });

  it('skips when not entry', async () => {
    process.argv = ['node', otherPath];
    const mockFn = vi.fn();
    await runIfMain(entryUrl, mockFn);
    expect(mockFn).not.toHaveBeenCalled();
  });
});
