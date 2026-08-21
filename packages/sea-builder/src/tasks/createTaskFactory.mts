import type {
  existsSync as concretedExistsSync,
  mkdirSync as concretedMkdirSync,
} from 'node:fs';
import type { mkdir as concretedMkdir } from 'node:fs/promises';
import type {
  DownloadFunction,
  VerifyCachedArchiveFunction,
} from '../utils/types.mjs';
import type { ArchiveMeta } from './createMetaFactory.mjs';

/** Type definition for a Listr task that downloads Node.js archives. */
export interface Task {
  /** Function that performs the download task. */
  readonly task: () => Promise<unknown>;

  /** Title of the task displayed in the Listr output. */
  readonly title: string;
}

/**
 * Create a function that converts metadata into a Listr task.
 * @param download File download function.
 * @param verifyCachedArchive Function that re-verifies an existing
 *   cache-hit archive against its published checksum, removing it and
 *   returning `false` when it cannot be verified.
 * @param existsSync File existence check function.
 * @param mkdir Directory creation function.
 * @param cacheDir Directory for cached archives.
 * @returns Function producing Listr tasks.
 */
export const createTaskFactory =
  (
    download: DownloadFunction,
    verifyCachedArchive: VerifyCachedArchiveFunction,
    existsSync: typeof concretedExistsSync,
    mkdir: typeof concretedMkdirSync | typeof concretedMkdir,
    cacheDir: string,
  ) =>
  (meta: ArchiveMeta): Task => {
    const { target: title, archivePath, url } = meta;
    return {
      task: async () => {
        await mkdir(cacheDir, { recursive: true });
        // A cache "hit" only counts once the file re-verifies against
        // the published checksum -- see verifyCachedArchive's own doc
        // comment for why an unverified existing file cannot be trusted
        // now that this cache directory is shared with xsea. The
        // short-circuit keeps a genuine cache miss (existsSync false) at
        // zero extra network cost: verifyCachedArchive's own
        // SHASUMS256.txt fetch only runs on an actual hit.
        const cacheHit =
          existsSync(archivePath) &&
          (await verifyCachedArchive(url, archivePath));
        if (!cacheHit) {
          await download(url, archivePath);
        }
      },
      title,
    };
  };
