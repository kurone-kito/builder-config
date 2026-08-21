import { basename } from 'node:path/posix';
import { findExpectedChecksum } from './findExpectedChecksum.mjs';

/**
 * Fetch `SHASUMS256.txt` alongside {@link url} and look up the published
 * SHA-256 checksum for the archive it names.
 *
 * Shared by the download-time verification in `downloadArchive` and the
 * cache-hit re-verification in `verifyCachedArchive`, so the
 * `SHASUMS256.txt` fetch-and-parse logic exists in exactly one place.
 * @param url Source URL of the archive to look up.
 * @returns The expected lowercase hex SHA-256 digest.
 * @throws {Error} If the `SHASUMS256.txt` request fails, or if
 *   {@link findExpectedChecksum} cannot find or parse a matching entry.
 */
export const fetchExpectedChecksum = async (url: string): Promise<string> => {
  const filename = basename(new URL(url).pathname);
  const shasumsUrl = new URL('SHASUMS256.txt', url);
  const response = await fetch(shasumsUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${shasumsUrl.toString()}: HTTP ${response.status}`,
    );
  }
  return findExpectedChecksum(await response.text(), filename);
};
