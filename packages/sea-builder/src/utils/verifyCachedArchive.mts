import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { rm } from 'node:fs/promises';
import { fetchExpectedChecksum } from './fetchExpectedChecksum.mjs';

/**
 * Stream-hash an existing file with SHA-256, matching the chunk-update
 * pattern `downloadArchive` uses for a fresh download.
 * @param path Path to the file to hash.
 * @returns The lowercase hex SHA-256 digest.
 */
const hashFile = async (path: string): Promise<string> => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk as Uint8Array);
  }
  return hash.digest('hex');
};

/**
 * Re-verify an existing cache-hit archive against the published SHA-256
 * checksum in `SHASUMS256.txt`, matching the same zero-tolerance
 * verification `downloadArchive` performs on a fresh download.
 *
 * Now that `sea-builder` shares its cache directory and filename
 * convention with `xsea`'s own unverified `fetch` → write, an existing
 * file at {@link archivePath} may never have been checksum-verified.
 * This closes that gap: on any failure to confirm the checksum — a
 * mismatch, or an error fetching or parsing `SHASUMS256.txt`, or a file
 * read error — the file at {@link archivePath} is removed so the caller
 * can fall through to a fresh, verified `downloadArchive` call, matching
 * the "leaves no file behind" self-healing philosophy `downloadArchive`
 * already documents for an interrupted download.
 *
 * The stale-file removal deliberately propagates its own failure rather
 * than being swallowed: `downloadArchive`'s internal `moveIntoPlace`
 * helper treats an already-present destination file as evidence that a
 * concurrent caller already checksum-verified it (its Windows
 * `EPERM`/`EBUSY` recovery path). If a failed `rm` here were silently
 * ignored, that untrusted stale file would still be sitting at
 * {@link archivePath} when `downloadArchive` runs next, and
 * `moveIntoPlace` could mistake it for already-verified bytes —
 * reopening the exact gap this function closes.
 * @param url Source URL used to derive the checksum lookup.
 * @param archivePath Path to the existing cached file to verify.
 * @returns `true` when the file's checksum matches and it was kept;
 *   `false` when it did not (or could not be verified) and was removed.
 */
export const verifyCachedArchive = async (
  url: string,
  archivePath: string,
): Promise<boolean> => {
  try {
    const expectedChecksum = await fetchExpectedChecksum(url);
    const actualChecksum = await hashFile(archivePath);
    if (actualChecksum === expectedChecksum) {
      return true;
    }
  } catch {
    // Falls through to the same stale-file cleanup as a genuine
    // checksum mismatch -- see the self-healing rationale above.
  }
  await rm(archivePath, { force: true });
  return false;
};
