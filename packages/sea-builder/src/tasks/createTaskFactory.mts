import type {
  existsSync as concretedExistsSync,
  mkdirSync as concretedMkdirSync,
} from 'node:fs';
import type { mkdir as concretedMkdir } from 'node:fs/promises';
import type { DownloadFunction } from '../utils/types.mjs';
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
 * @param existsSync File existence check function.
 * @param mkdir Directory creation function.
 * @param cacheDir Directory for cached archives.
 * @returns Function producing Listr tasks.
 */
export const createTaskFactory =
  (
    download: DownloadFunction,
    existsSync: typeof concretedExistsSync,
    mkdir: typeof concretedMkdirSync | typeof concretedMkdir,
    cacheDir: string,
  ) =>
  (meta: ArchiveMeta): Task => {
    const { target: title, archivePath, url } = meta;
    return {
      task: async () => {
        await mkdir(cacheDir, { recursive: true });
        if (!existsSync(archivePath)) {
          await download(url, archivePath);
        }
      },
      title,
    };
  };
