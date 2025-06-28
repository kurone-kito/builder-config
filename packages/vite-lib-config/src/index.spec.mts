import { expect, it } from 'vitest';
import hello from './index.mjs';

it('should export an empty object', () => expect(hello).toEqual({}));
