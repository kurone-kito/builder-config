import type { PipelineSource, Stream } from 'node:stream';

/**
 * Convert a stream to a pipeline source.
 * @param s Stream to convert.
 * @returns Pipeline source stream.
 * @throws {TypeError} If the stream is not readable.
 */
export const toPipelineSource = (s: Stream): PipelineSource<unknown> => {
  if ((s as unknown as NodeJS.ReadableStream).readable) {
    return s as unknown as NodeJS.ReadableStream;
  }
  const msg =
    'Streams that are not readable cannot be used as pipeline sources.';
  throw new TypeError(msg);
};
