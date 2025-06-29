import { PassThrough, Writable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { toPipelineSource } from './toPipelineSource.mjs';

describe('toPipelineSource', () => {
  it('returns the stream when readable', () => {
    const stream = new PassThrough();
    expect(toPipelineSource(stream)).toBe(stream);
  });

  it('throws for non readable streams', () => {
    const stream = new Writable();
    Object.defineProperty(stream, 'readable', { value: false });
    expect(() => toPipelineSource(stream as unknown as PassThrough)).toThrow(
      TypeError,
    );
  });
});
