import type { execa } from 'execa';
import { describe, expect, it, vi } from 'vitest';
import { createSeaTask } from './createSeaTask.mjs';

describe('createSeaTask', () => {
  it('runs xsea with targets', async () => {
    const calls: Array<readonly [string, readonly string[]]> = [];
    const runExeca = (cmd: string, args: readonly string[]): Promise<void> => {
      calls.push([cmd, [...args]]);
      return Promise.resolve();
    };
    await createSeaTask(
      runExeca as unknown as typeof execa,
      ['linux-x64', 'win32-x64'],
      'foo',
    ).task();
    expect(calls[0]).toEqual([
      'pnpm',
      [
        'exec',
        'xsea',
        'dist/index.mjs',
        '-o',
        'sea/foo',
        '-t',
        'linux-x64',
        '-t',
        'win32-x64',
      ],
    ]);
  });

  it('sets title', () =>
    expect(createSeaTask(vi.fn(), [], 'foo').title).toBe(
      'Linking the SEA binary',
    ));
});
