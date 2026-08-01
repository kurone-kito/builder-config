import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { rename as nodeRename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadArchive } from './downloadArchive.mjs';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return { ...actual, rename: vi.fn(actual.rename) };
});

const ARCHIVE_CONTENT = 'fake-archive-bytes';
const ARCHIVE_NAME = 'node-v22.23.1-linux-x64.tar.gz';
const ARCHIVE_HASH = createHash('sha256').update(ARCHIVE_CONTENT).digest('hex');
const ARCHIVE_URL = `https://nodejs.org/dist/v22.23.1/${ARCHIVE_NAME}`;

const bodyStream = (content: string): ReadableStream<Uint8Array> =>
  new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(content));
      controller.close();
    },
  });

const erroringBodyStream = (
  partial: string,
  error: Error,
): ReadableStream<Uint8Array> =>
  new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(partial));
      controller.error(error);
    },
  });

const shasumsResponse = (body: string, ok = true, status = 200) => ({
  ok,
  status,
  text: async () => body,
});

const archiveResponse = (
  body: ReadableStream<Uint8Array> | null,
  ok = true,
  status = 200,
) => ({ body, ok, status });

let dir: string;
let dest: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'download-archive-'));
  dest = join(dir, ARCHIVE_NAME);
});

afterEach(() => {
  rmSync(dir, { force: true, recursive: true });
  vi.unstubAllGlobals();
});

describe('downloadArchive', () => {
  it('downloads and verifies a valid archive', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse(`${ARCHIVE_HASH}  ${ARCHIVE_NAME}\n`)
          : archiveResponse(bodyStream(ARCHIVE_CONTENT)),
      ),
    );

    await downloadArchive(ARCHIVE_URL, dest);

    expect(existsSync(dest)).toBe(true);
    expect(readFileSync(dest, 'utf8')).toBe(ARCHIVE_CONTENT);
    expect(readdirSync(dir)).toEqual([ARCHIVE_NAME]);
  });

  it('looks up the checksum by the URL filename, not the dest filename', async () => {
    const renamedDest = join(dir, 'renamed-locally.tar.gz');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse(`${ARCHIVE_HASH}  ${ARCHIVE_NAME}\n`)
          : archiveResponse(bodyStream(ARCHIVE_CONTENT)),
      ),
    );

    await downloadArchive(ARCHIVE_URL, renamedDest);

    expect(existsSync(renamedDest)).toBe(true);
    expect(readFileSync(renamedDest, 'utf8')).toBe(ARCHIVE_CONTENT);
  });

  it('accepts an uppercase-hex checksum entry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse(`${ARCHIVE_HASH.toUpperCase()}  ${ARCHIVE_NAME}\n`)
          : archiveResponse(bodyStream(ARCHIVE_CONTENT)),
      ),
    );

    await downloadArchive(ARCHIVE_URL, dest);

    expect(readFileSync(dest, 'utf8')).toBe(ARCHIVE_CONTENT);
  });

  it('throws on a checksum entry that is not a 64-character hex digest', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse(`not-a-hash  ${ARCHIVE_NAME}\n`)
          : archiveResponse(bodyStream(ARCHIVE_CONTENT)),
      ),
    );

    await expect(downloadArchive(ARCHIVE_URL, dest)).rejects.toThrow(
      /Malformed checksum entry/,
    );
    expect(existsSync(dest)).toBe(false);
  });

  it('treats a rename refused by an already-placed destination as success', async () => {
    writeFileSync(dest, ARCHIVE_CONTENT);
    vi.mocked(nodeRename).mockRejectedValueOnce(
      Object.assign(new Error('EPERM: operation not permitted, rename'), {
        code: 'EPERM',
      }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse(`${ARCHIVE_HASH}  ${ARCHIVE_NAME}\n`)
          : archiveResponse(bodyStream(ARCHIVE_CONTENT)),
      ),
    );

    await expect(downloadArchive(ARCHIVE_URL, dest)).resolves.toBeUndefined();

    expect(readFileSync(dest, 'utf8')).toBe(ARCHIVE_CONTENT);
    expect(readdirSync(dir)).toEqual([ARCHIVE_NAME]);
  });

  it('propagates a rename failure when the destination was not placed by a winner', async () => {
    const eperm = Object.assign(
      new Error('EPERM: operation not permitted, rename'),
      { code: 'EPERM' },
    );
    vi.mocked(nodeRename).mockRejectedValueOnce(eperm);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse(`${ARCHIVE_HASH}  ${ARCHIVE_NAME}\n`)
          : archiveResponse(bodyStream(ARCHIVE_CONTENT)),
      ),
    );

    await expect(downloadArchive(ARCHIVE_URL, dest)).rejects.toThrow(eperm);
    expect(existsSync(dest)).toBe(false);
    expect(readdirSync(dir)).toEqual([]);
  });

  it('throws and leaves no file for a non-2xx archive response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => archiveResponse(null, false, 404)),
    );

    await expect(downloadArchive(ARCHIVE_URL, dest)).rejects.toThrow(
      /HTTP 404/,
    );
    expect(existsSync(dest)).toBe(false);
  });

  it('throws and leaves no file for a non-2xx SHASUMS256.txt response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse('', false, 404)
          : archiveResponse(bodyStream(ARCHIVE_CONTENT)),
      ),
    );

    await expect(downloadArchive(ARCHIVE_URL, dest)).rejects.toThrow(
      /HTTP 404/,
    );
    expect(existsSync(dest)).toBe(false);
  });

  it('throws when no checksum entry names the archive', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse('deadbeef  some-other-file.tar.gz\n')
          : archiveResponse(bodyStream(ARCHIVE_CONTENT)),
      ),
    );

    await expect(downloadArchive(ARCHIVE_URL, dest)).rejects.toThrow(
      /No checksum entry/,
    );
    expect(existsSync(dest)).toBe(false);
  });

  it('throws and leaves no file when the checksum does not match', async () => {
    const wrongChecksum = 'd'.repeat(64);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse(`${wrongChecksum}  ${ARCHIVE_NAME}\n`)
          : archiveResponse(bodyStream(ARCHIVE_CONTENT)),
      ),
    );

    await expect(downloadArchive(ARCHIVE_URL, dest)).rejects.toThrow(
      /Checksum mismatch/,
    );
    expect(existsSync(dest)).toBe(false);
  });

  it('leaves no temporary file when the download stream errors mid-transfer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) =>
        input.toString().endsWith('SHASUMS256.txt')
          ? shasumsResponse(`${ARCHIVE_HASH}  ${ARCHIVE_NAME}\n`)
          : archiveResponse(
              erroringBodyStream(
                'partial-bytes',
                new Error('network interrupted'),
              ),
            ),
      ),
    );

    await expect(downloadArchive(ARCHIVE_URL, dest)).rejects.toThrow(
      /network interrupted/,
    );
    expect(existsSync(dest)).toBe(false);
    expect(readdirSync(dir)).toEqual([]);
  });

  it('throws when the archive response body is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => archiveResponse(null)),
    );

    await expect(downloadArchive(ARCHIVE_URL, dest)).rejects.toThrow(
      /Response body is empty/,
    );
    expect(existsSync(dest)).toBe(false);
  });
});
