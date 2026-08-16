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

  it('maps a derived win32 default to win', () => {
    expect(normalizeTargets([], 'win32', 'x64')).toEqual(['win-x64']);
  });

  it('maps a caller-supplied win32 target to win', () => {
    expect(normalizeTargets(['win32-arm64'], 'linux', 'x64')).toEqual([
      'win-arm64',
    ]);
  });

  it('maps a derived Windows ia32 default to x86', () => {
    expect(normalizeTargets([], 'win32', 'ia32')).toEqual(['win-x86']);
  });

  it('maps a caller-supplied Windows ia32 target to x86', () => {
    expect(normalizeTargets(['win32-ia32'], 'linux', 'x64')).toEqual([
      'win-x86',
    ]);
  });

  it('maps a derived arm default to armv7l', () => {
    expect(normalizeTargets([], 'linux', 'arm')).toEqual(['linux-armv7l']);
  });

  it('maps a caller-supplied arm target to armv7l', () => {
    expect(normalizeTargets(['linux-arm'], 'darwin', 'x64')).toEqual([
      'linux-armv7l',
    ]);
  });

  it('leaves an already-canonical target unchanged', () => {
    expect(normalizeTargets(['win-x64'], 'linux', 'x64')).toEqual(['win-x64']);
  });

  it('does not map ia32 on non-Windows targets', () => {
    expect(normalizeTargets(['linux-ia32'], 'linux', 'x64')).toEqual([
      'linux-ia32',
    ]);
  });

  it('is idempotent on its own output', () => {
    const first = normalizeTargets(['win32-ia32', 'linux-arm'], 'win32', 'x64');
    expect(normalizeTargets(first, 'win32', 'x64')).toEqual(first);
  });
});
