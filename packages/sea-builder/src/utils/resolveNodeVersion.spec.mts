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
    // Node 20 (Iron) ends 2026-04-30 per node-releases' real schedule
    // data — past end-of-life relative to the fixed `now` below, despite
    // all-node-versions still marking it `lts` — proves the default
    // skips an already-EOL LTS rather than picking the oldest one that
    // ever had a codename.
    { major: 20, latest: '20.12.0', lts: 'iron' },
  ],
} as const satisfies AllNodeVersions;

// Fixed rather than the real clock, so this test doesn't start failing
// once Node 22 (Jod) itself passes its own 2027-04-30 end date.
const now = new Date('2026-08-01');

beforeEach(() => {
  vi.mocked(allNodeVersions).mockResolvedValue(mockData);
});

describe('resolveNodeVersion', () => {
  it('resolves latest patch of oldest currently-supported LTS by default, skipping an EOL one', async () => {
    await expect(resolveNodeVersion(undefined, now)).resolves.toBe('v22.5.0');
  });

  it('handles major range', async () => {
    await expect(resolveNodeVersion('20')).resolves.toBe('v20.12.0');
  });

  it('handles minor range', async () => {
    await expect(resolveNodeVersion('20.11')).resolves.toBe('v20.11.1');
  });

  it('advances the default once the oldest supported LTS itself ends', async () => {
    // Node 22 (Jod) ends 2027-04-30 per node-releases' real schedule.
    const afterJod = new Date('2027-06-01');
    await expect(resolveNodeVersion(undefined, afterJod)).resolves.toBe(
      'v24.0.0',
    );
  });

  it('throws rather than silently falling back to the newest release when every LTS in scope has ended', async () => {
    // Node 24 (Krypton), the newest mocked major, ends 2028-04-30.
    const afterEveryMockedLts = new Date('2030-01-01');
    await expect(
      resolveNodeVersion(undefined, afterEveryMockedLts),
    ).rejects.toThrow(/no currently-supported lts line/i);
  });
});
