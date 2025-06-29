import type { execa } from 'execa';
import { describe, expect, it, vi } from 'vitest';
import { createBuildTask } from './createBuildTask.mjs';

describe('createBuildTask', () => {
  it('runs pnpm build', async () => {
    const calls: Array<readonly [string, readonly string[]]> = [];
    const runExeca = (cmd: string, args: readonly string[]): Promise<void> => {
      calls.push([cmd, [...args]]);
      return Promise.resolve();
    };
    await createBuildTask(runExeca as unknown as typeof execa).task();
    expect(calls).toContainEqual(['pnpm', ['run', 'build']]);
  });

  it('sets title', () => {
    expect(createBuildTask(vi.fn()).title).toBe('Build');
  });
});
