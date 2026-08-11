import { describe, expect, it } from 'vitest';
import { filterSupportedLts } from './filterSupportedLts.mjs';

const majors = [
  { major: 26, latest: '26.0.0' },
  { major: 25, latest: '25.9.0' },
  { major: 24, latest: '24.18.1', lts: 'krypton' },
  { major: 23, latest: '23.11.1' },
  { major: 22, latest: '22.23.2', lts: 'jod' },
  { major: 20, latest: '20.20.2', lts: 'iron' },
  { major: 18, latest: '18.20.8', lts: 'hydrogen' },
  { major: 4, latest: '4.9.1', lts: 'argon' },
] as const;

describe('filterSupportedLts', () => {
  it('excludes non-LTS majors', () => {
    const now = new Date('2026-08-11');
    expect(filterSupportedLts(majors, now)).not.toContainEqual(
      expect.objectContaining({ major: 26 }),
    );
  });

  it('excludes an LTS major whose support window has already ended', () => {
    // Node 20 (Iron) ends 2026-04-30; Node 18 (Hydrogen) ends 2025-04-30.
    const now = new Date('2026-08-11');
    const result = filterSupportedLts(majors, now);
    expect(result).not.toContainEqual(expect.objectContaining({ major: 20 }));
    expect(result).not.toContainEqual(expect.objectContaining({ major: 18 }));
  });

  it('excludes a long-retired LTS major', () => {
    const now = new Date('2026-08-11');
    expect(filterSupportedLts(majors, now)).not.toContainEqual(
      expect.objectContaining({ major: 4 }),
    );
  });

  it('keeps LTS majors still within their support window', () => {
    const now = new Date('2026-08-11');
    const result = filterSupportedLts(majors, now);
    expect(result).toContainEqual(expect.objectContaining({ major: 24 }));
    expect(result).toContainEqual(expect.objectContaining({ major: 22 }));
  });

  it('still counts the scheduled end date itself as supported', () => {
    // Node 20 (Iron) ends 2026-04-30; a date-only string parses as that
    // day's UTC midnight, so a naive `> now` comparison would treat the
    // entire end date as already unsupported.
    const stillOnEndDate = new Date('2026-04-30T18:00:00.000Z');
    expect(filterSupportedLts(majors, stillOnEndDate)).toContainEqual(
      expect.objectContaining({ major: 20 }),
    );
  });

  it('excludes it starting the day after the scheduled end date', () => {
    const dayAfterEnd = new Date('2026-05-01T00:00:00.001Z');
    expect(filterSupportedLts(majors, dayAfterEnd)).not.toContainEqual(
      expect.objectContaining({ major: 20 }),
    );
  });
});
