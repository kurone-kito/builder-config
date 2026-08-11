import type { AllNodeVersions } from 'all-node-versions';
import allNodeVersions from 'all-node-versions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveNodeVersion } from './resolveNodeVersion.mjs';

vi.mock('all-node-versions');

const mockData = {
  versions: [
    { node: '24.0.0' },
    { node: '22.5.0' },
    { node: '22.1.0' },
    { node: '20.12.0' },
    { node: '20.11.1' },
    { node: '20.11.0' },
  ],
  majors: [
    { major: 24, latest: '24.0.0', lts: 'krypton' },
    { major: 22, latest: '22.5.0', lts: 'jod' },
    // Node 20 (Iron) is genuinely past end-of-life (2026-04-30 per
    // node-releases' real schedule data) despite all-node-versions still
    // marking it `lts` — proves the default skips an already-EOL LTS
    // rather than picking the oldest one that ever had a codename.
    { major: 20, latest: '20.12.0', lts: 'iron' },
  ],
} as const satisfies AllNodeVersions;

beforeEach(() => {
  vi.mocked(allNodeVersions).mockResolvedValue(mockData);
});

describe('resolveNodeVersion', () => {
  it('resolves latest patch of oldest currently-supported LTS by default, skipping an EOL one', async () => {
    await expect(resolveNodeVersion()).resolves.toBe('v22.5.0');
  });

  it('handles major range', async () => {
    await expect(resolveNodeVersion('20')).resolves.toBe('v20.12.0');
  });

  it('handles minor range', async () => {
    await expect(resolveNodeVersion('20.11')).resolves.toBe('v20.11.1');
  });
});
