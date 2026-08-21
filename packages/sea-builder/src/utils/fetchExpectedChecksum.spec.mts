import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchExpectedChecksum } from './fetchExpectedChecksum.mjs';

const ARCHIVE_NAME = 'node-v22.23.2-linux-x64.tar.gz';
const ARCHIVE_URL = `https://nodejs.org/dist/v22.23.2/${ARCHIVE_NAME}`;
const HASH = 'a'.repeat(64);

const shasumsResponse = (body: string, ok = true, status = 200) => ({
  ok,
  status,
  text: async () => body,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchExpectedChecksum', () => {
  it('fetches SHASUMS256.txt alongside the archive URL and looks up the checksum', async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      expect(input.toString()).toBe(
        'https://nodejs.org/dist/v22.23.2/SHASUMS256.txt',
      );
      return shasumsResponse(`${HASH}  ${ARCHIVE_NAME}\n`);
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchExpectedChecksum(ARCHIVE_URL)).resolves.toBe(HASH);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws for a non-2xx SHASUMS256.txt response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => shasumsResponse('', false, 404)),
    );

    await expect(fetchExpectedChecksum(ARCHIVE_URL)).rejects.toThrow(
      /HTTP 404/,
    );
  });

  it('propagates a findExpectedChecksum lookup failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => shasumsResponse('deadbeef  some-other-file.tar.gz\n')),
    );

    await expect(fetchExpectedChecksum(ARCHIVE_URL)).rejects.toThrow(
      /No checksum entry/,
    );
  });
});
