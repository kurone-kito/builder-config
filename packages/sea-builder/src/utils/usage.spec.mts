import { describe, expect, it, vi } from 'vitest';
import { usage } from './usage.mjs';

describe('usage', () => {
  it('prints help message', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    usage();
    expect(spy).toHaveBeenCalledWith(
      'Usage: sea-builder --targets=<target>[,<target>[,...]] [--node=<version>] <output>',
    );
    spy.mockRestore();
  });
});
