import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/*.config.*', '**/coverage/**', '**/dist/**'],
      include: ['packages/*/src/**'],
      provider: 'v8',
    },
    projects: ['packages/*'],
  },
});
