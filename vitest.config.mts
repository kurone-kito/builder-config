import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['.*', '**/*.config.*', '**/coverage/**', '**/dist/**'],
      provider: 'v8',
    },
    projects: ['packages/*'],
  },
});
