import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyCachedArchive } from './verifyCachedArchive.mjs';

const ARCHIVE_CONTENT = 'fake-archive-bytes';
const ARCHIVE_NAME = 'node-v22.23.2-linux-x64.tar.gz';
const ARCHIVE_HASH = createHash('sha256').update(ARCHIVE_CONTENT).digest('hex');
const ARCHIVE_URL = `https://nodejs.org/dist/v22.23.2/${ARCHIVE_NAME}`;

const shasumsResponse = (body: string, ok = true, status = 200) => ({
  ok,
  status,
  text: async () => body,
});

let dir: string;
let archivePath: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'verify-cached-archive-'));
  archivePath = join(dir, ARCHIVE_NAME);
  writeFileSync(archivePath, ARCHIVE_CONTENT);
});

afterEach(() => {
  rmSync(dir, { force: true, recursive: true });
  vi.unstubAllGlobals();
});

describe('verifyCachedArchive', () => {
  it('keeps the file and returns true on a matching checksum', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => shasumsResponse(`${ARCHIVE_HASH}  ${ARCHIVE_NAME}\n`)),
    );

    await expect(verifyCachedArchive(ARCHIVE_URL, archivePath)).resolves.toBe(
      true,
    );
    expect(existsSync(archivePath)).toBe(true);
  });

  it('removes the file and returns false on a checksum mismatch', async () => {
    const wrongChecksum = 'd'.repeat(64);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => shasumsResponse(`${wrongChecksum}  ${ARCHIVE_NAME}\n`)),
    );

    await expect(verifyCachedArchive(ARCHIVE_URL, archivePath)).resolves.toBe(
      false,
    );
    expect(existsSync(archivePath)).toBe(false);
  });

  it('removes the file and returns false when SHASUMS256.txt cannot be fetched', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => shasumsResponse('', false, 404)),
    );

    await expect(verifyCachedArchive(ARCHIVE_URL, archivePath)).resolves.toBe(
      false,
    );
    expect(existsSync(archivePath)).toBe(false);
  });

  it('removes the file and returns false when no checksum entry names the archive', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => shasumsResponse('deadbeef  some-other-file.tar.gz\n')),
    );

    await expect(verifyCachedArchive(ARCHIVE_URL, archivePath)).resolves.toBe(
      false,
    );
    expect(existsSync(archivePath)).toBe(false);
  });
});
