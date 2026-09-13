import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/*.config.*', '**/coverage/**', '**/dist/**'],
      include: ['packages/*/src/**'],
      provider: 'v8',
    },
    projects: [
      'packages/*',
      {
        test: {
          environment: 'node',
          include: ['scripts/**/*.spec.mts'],
          name: 'scripts',
          // Each test spawns several real `git` subprocesses (init,
          // config, commit, push) against a scratch repo; process-spawn
          // overhead on Windows CI runners can exceed the 5s default.
          testTimeout: 20_000,
        },
      },
    ],
  },
});
