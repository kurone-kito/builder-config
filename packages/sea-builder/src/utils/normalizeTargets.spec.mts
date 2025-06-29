import { describe, expect, it } from 'vitest';
import { normalizeTargets } from './normalizeTargets.mjs';

describe('normalizeTargets', () => {
  it('returns "platform-arch" when array is empty', () => {
    expect(normalizeTargets([], 'linux', 'x64')).toEqual(['linux-x64']);
  });

  it('returns the same array when elements exist', () => {
    expect(normalizeTargets(['darwin-arm64'], 'linux', 'x64')).toEqual([
      'darwin-arm64',
    ]);
  });
});
