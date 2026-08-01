import { createHash, randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { access, rename, rm } from 'node:fs/promises';
import { basename } from 'node:path/posix';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web';
import type { DownloadFunction } from './types.mjs';

/** Matches a 64-character lowercase or uppercase hex SHA-256 digest. */
const SHA256_HEX = /^[0-9a-fA-F]{64}$/;

/**
 * Convert a Fetch API {@link Response.body} into a Node.js
 * {@link Readable}.
 *
 * `fetch`'s `Response.body` is typed against the DOM `lib.dom.d.ts`
 * `ReadableStream`, while {@link Readable.fromWeb} expects
 * `node:stream/web`'s `ReadableStream`. The two describe the same
 * runtime object but are not mutually assignable under TypeScript, so
 * this is an explicit, narrowly-scoped cast rather than a bare
 * `@ts-expect-error` on the call site.
 * @param body A Fetch API response body stream.
 * @returns The same stream, as a Node.js {@link Readable}.
 */
const toNodeReadable = (body: ReadableStream<Uint8Array>): Readable =>
  Readable.fromWeb(body as unknown as NodeWebReadableStream<Uint8Array>);

/**
 * Find the published SHA-256 checksum for a file in a `SHASUMS256.txt`
 * listing.
 * @param shasums Contents of the `SHASUMS256.txt` file.
 * @param filename Archive file name to look up.
 * @returns The expected lowercase hex SHA-256 digest.
 * @throws {Error} If no parseable checksum line names `filename`, or the
 *   token found is not a 64-character hex digest.
 */
const findExpectedChecksum = (shasums: string, filename: string): string => {
  const line = shasums
    .split('\n')
    .find((l) => l.trim().split(/\s+/).at(-1) === filename);
  const checksum = line?.trim().split(/\s+/).at(0);
  if (!checksum) {
    throw new Error(`No checksum entry found for ${filename}`);
  }
  if (!SHA256_HEX.test(checksum)) {
    throw new Error(`Malformed checksum entry for ${filename}: ${checksum}`);
  }
  return checksum.toLowerCase();
};

/**
 * Move a verified temporary download onto its final destination.
 *
 * `rename` is atomic on POSIX even when {@link dest} already exists, but
 * Windows can refuse to replace a destination that another process holds
 * open (`EPERM`/`EBUSY`) — notably when a concurrent {@link downloadArchive}
 * call for the same target already won the race. In that case {@link dest}
 * now holds bytes another call already checksum-verified, so this call's
 * own (identical) temporary file is redundant and simply discarded rather
 * than surfaced as an error.
 * @param tempPath Path to the verified temporary file.
 * @param dest Final destination path.
 */
const moveIntoPlace = async (tempPath: string, dest: string): Promise<void> => {
  try {
    await rename(tempPath, dest);
  } catch (error) {
    await access(dest).catch(() => {
      throw error;
    });
    await rm(tempPath, { force: true });
  }
};

/**
 * Download a Node.js archive to a temporary path, verify it against the
 * published `SHASUMS256.txt` checksum, then atomically move it onto
 * {@link dest}. A non-2xx response, a missing or unparseable checksum
 * entry, or a checksum mismatch all throw and leave no file behind at
 * {@link dest}; a failed or interrupted attempt removes its own
 * temporary file so the next run does not treat it as a cache hit.
 * @param url Source URL.
 * @param dest Destination file path.
 */
export const downloadArchive: DownloadFunction = async (url, dest) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
  }
  if (!response.body) {
    throw new Error('Response body is empty');
  }
  const filename = basename(new URL(url).pathname);
  const shasumsUrl = new URL('SHASUMS256.txt', url);
  const shasumsResponse = await fetch(shasumsUrl);
  if (!shasumsResponse.ok) {
    throw new Error(
      `Failed to download ${shasumsUrl.toString()}: HTTP ${shasumsResponse.status}`,
    );
  }
  const expectedChecksum = findExpectedChecksum(
    await shasumsResponse.text(),
    filename,
  );

  const tempPath = `${dest}.download-${process.pid}-${randomUUID()}`;
  try {
    const hash = createHash('sha256');
    await pipeline(
      toNodeReadable(response.body),
      async function* (source) {
        for await (const chunk of source) {
          hash.update(chunk as Uint8Array);
          yield chunk;
        }
      },
      createWriteStream(tempPath),
    );
    const actualChecksum = hash.digest('hex');
    if (actualChecksum !== expectedChecksum) {
      throw new Error(
        `Checksum mismatch for ${filename}: expected ${expectedChecksum}, got ${actualChecksum}`,
      );
    }
    await moveIntoPlace(tempPath, dest);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
};
