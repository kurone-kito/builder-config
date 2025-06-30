import { describe, expect, it } from 'vitest';
import { parseArgs } from './parseArgs.mjs';

describe('parseArgs', () => {
  it('parses targets and basename', () => {
    const actual = parseArgs([
      '--targets=linux-x64,win32-x64',
      '--node=20',
      'my-cli',
    ]);
    expect(actual).toHaveProperty('basename', 'my-cli');
    expect(actual).toHaveProperty('help', false);
    expect(actual).toHaveProperty('nodeVersion', '20');
    expect(actual).toHaveProperty('targets', ['linux-x64', 'win32-x64']);
  });

  it('handles help option', () =>
    expect(parseArgs(['--help'])).toHaveProperty('help', true));

  it('throws when basename is missing', () =>
    expect(() => parseArgs([])).toThrowError());
});
