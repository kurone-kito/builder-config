import { expect, it } from 'vitest';
import hello from './index.mjs';

it('should export hello', () => expect(hello).toBe('Hello, world!'));
