import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createMetaFactory } from './createMetaFactory.mjs';

describe('createMetaFactory', () => {
  const factory = createMetaFactory('/cache', 'v1.0.0');

  it('generates metadata for unix targets', () => {
    expect(factory('linux-x64')).toEqual({
      target: 'linux-x64',
      archivePath: join('/cache', 'node-v1.0.0-linux-x64.tar.gz'),
      url: 'https://nodejs.org/dist/v1.0.0/node-v1.0.0-linux-x64.tar.gz',
    });
  });

  it('uses zip extension for windows', () => {
    expect(factory('win32-x64')).toEqual({
      target: 'win32-x64',
      archivePath: join('/cache', 'node-v1.0.0-win32-x64.zip'),
      url: 'https://nodejs.org/dist/v1.0.0/node-v1.0.0-win32-x64.zip',
    });
  });
});
