import { mergeConfig } from 'vitest/config';
import { viteConfig } from './src/vite.mjs';

export default mergeConfig(viteConfig(), { test: { environment: 'node' } });
