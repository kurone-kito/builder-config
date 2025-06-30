import type { existsSync, mkdirSync } from 'node:fs';
import type { mkdir } from 'node:fs/promises';

/** Type definition for a function that downloads files. */
export type DownloadFunction = (url: string, dest: string) => Promise<void>;

/**
 * Type definition for a function that checks file existence.
 * @see {@link existsSync}
 */
export type ExistsSync = typeof existsSync;

/** Type definition for a function that creates directories. */
export type Mkdir = typeof mkdir | typeof mkdirSync;
