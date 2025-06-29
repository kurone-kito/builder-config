import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import type { DownloadFunction } from './types.mjs';

/**
 * Download Node.js archive.
 * @param url Source URL.
 * @param dest Destination file path.
 */
export const downloadArchive: DownloadFunction = async (url, dest) => {
  const response = await fetch(url);
  if (!response.body) {
    throw new Error('Response body is empty');
  }
  // @ts-expect-error
  await pipeline(response.body, createWriteStream(dest));
};
