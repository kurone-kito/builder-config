import { describe, expect, it } from 'vitest';
import { findExpectedChecksum } from './findExpectedChecksum.mjs';

const FILENAME = 'node-v22.23.2-linux-x64.tar.gz';
const HASH = 'a'.repeat(64);

describe('findExpectedChecksum', () => {
  it('finds a lowercase-hex checksum entry', () => {
    expect(findExpectedChecksum(`${HASH}  ${FILENAME}\n`, FILENAME)).toBe(HASH);
  });

  it('lowercases an uppercase-hex checksum entry', () => {
    expect(
      findExpectedChecksum(`${HASH.toUpperCase()}  ${FILENAME}\n`, FILENAME),
    ).toBe(HASH);
  });

  it('finds the matching line among multiple entries', () => {
    const other = 'b'.repeat(64);
    const shasums = `${other}  some-other-file.tar.gz\n${HASH}  ${FILENAME}\n`;
    expect(findExpectedChecksum(shasums, FILENAME)).toBe(HASH);
  });

  it('throws when no entry names the filename', () => {
    expect(() =>
      findExpectedChecksum(`${HASH}  some-other-file.tar.gz\n`, FILENAME),
    ).toThrow(/No checksum entry/);
  });

  it('throws when the matching entry is not a 64-character hex digest', () => {
    expect(() =>
      findExpectedChecksum(`not-a-hash  ${FILENAME}\n`, FILENAME),
    ).toThrow(/Malformed checksum entry/);
  });
});
