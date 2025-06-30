import { describe, expect, it } from 'vitest';
import { toSemver } from './toSemver.mjs';

const majors = [
  { major: 24, latest: '24.0.0' },
  { major: 22, latest: '22.1.0', lts: 'jod' },
  { major: 20, latest: '20.12.0', lts: 'iron' },
] as const;

describe('toSemver', () => {
  it('uses oldest LTS when spec is undefined', () => {
    expect(toSemver(undefined, majors)).toBe('^20');
  });

  it('handles minor versions', () => {
    expect(toSemver('20.11', majors)).toBe('~20.11');
  });

  it('handles major versions', () => {
    expect(toSemver('20', majors)).toBe('^20');
  });

  it('returns input for other formats', () => {
    expect(toSemver('>=20', majors)).toBe('>=20');
  });
});
