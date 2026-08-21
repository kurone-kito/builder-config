/** Matches a 64-character lowercase or uppercase hex SHA-256 digest. */
const SHA256_HEX = /^[0-9a-fA-F]{64}$/;

/**
 * Find the published SHA-256 checksum for a file in a `SHASUMS256.txt`
 * listing.
 * @param shasums Contents of the `SHASUMS256.txt` file.
 * @param filename Archive file name to look up.
 * @returns The expected lowercase hex SHA-256 digest.
 * @throws {Error} If no parseable checksum line names `filename`, or the
 *   token found is not a 64-character hex digest.
 */
export const findExpectedChecksum = (
  shasums: string,
  filename: string,
): string => {
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
