import { join } from 'node:path';

/** Metadata for a Node.js archive. */
export interface ArchiveMeta {
  /** Local archive path. */
  readonly archivePath: string;

  /** Target string such as `linux-x64`. */
  readonly target: string;

  /** Download URL of the archive. */
  readonly url: string;
}

/**
 * Create a function that generates metadata for a given target.
 * @param cacheDir Directory to store archives in.
 * @param nodeVersion Node.js version string.
 * @returns Function producing {@link ArchiveMeta} objects.
 */
export const createMetaFactory =
  (cacheDir: string, nodeVersion: string) =>
  (target: string): ArchiveMeta => {
    const ext = target.startsWith('win') ? 'zip' : 'tar.gz';
    const archive = `node-${nodeVersion}-${target}.${ext}`;
    return {
      target,
      archivePath: join(cacheDir, archive),
      url: `https://nodejs.org/dist/${nodeVersion}/${archive}`,
    };
  };
