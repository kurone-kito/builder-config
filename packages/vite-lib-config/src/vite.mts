import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import castArray from 'lodash-es/castArray.js';
import shebangRegex from 'shebang-regex';
import type { Arrayable } from 'type-fest';
import type { UserConfig } from 'vite';
import { mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';

/**
 * Type definition for options used when creating a Vite configuration.
 * @see {@link viteConfig}
 */
export interface ViteConfigOptions {
  /**
   * Base directory of the target project.
   * @default process.cwd()
   */
  readonly cwd?: string | undefined;

  /**
   * Entry files relative to {@link srcDir}.
   * @default ['index.mts']
   */
  readonly entries?: Readonly<Arrayable<string>> | undefined;

  /**
   * Directory where the source files are located.
   * @default 'src'
   */
  readonly srcDir?: string | undefined;
}

/** The name of the output file. */
const out = '[name].mjs';

/** Static configuration for Vite builds. */
const staticConfig = {
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: out,
        entryFileNames: out,
        format: 'es',
        importAttributesKey: 'with',
      },
    },
    sourcemap: true,
    ssr: true,
    target: 'node20.11',
  },
} as const satisfies UserConfig;

/**
 * Creates a Vite configuration based on the provided entry point.
 *
 * The entry point is `src/index.mts` under the provided working directory.
 * If the file starts with a shebang(`#!...`), the build uses library mode;
 * otherwise it performs an SSR build.
 * @param entries Entry point files for the Vite configuration.
 * @return A Vite {@link UserConfig} object with the configuration
 */
const innerCreateConfig = (entries: readonly string[]): UserConfig => {
  const entry = entries.filter((f) => existsSync(f));
  if (!entry.length) {
    return {};
  }
  const bin = entry.every((f) => shebangRegex.test(readFileSync(f, 'utf8')));
  return mergeConfig<UserConfig, UserConfig>(staticConfig, {
    build: {
      rollupOptions: { input: entry },
      ...(bin ? {} : { lib: { entry, formats: ['es'] } }),
    },
    plugins: bin ? [] : [dts({ exclude: ['**/*.spec.mts'] })],
  });
};

/**
 * Create a Vite configuration for the current project.
 *
 * The entry point is `src/index.mts` under the provided working directory.
 * If the file starts with a shebang(`#!...`), the build uses library mode;
 * otherwise it performs an SSR build. Additional settings can override
 * these defaults via {@link mergeConfig}.
 * @param overrides Additional configuration options to merge with the base
 * config.
 * @param options Options for creating the config, including the working
 * directory.
 * @return A Vite {@link UserConfig} object with the merged configuration.
 */
export const viteConfig = (
  overrides: UserConfig = {},
  options: ViteConfigOptions = {},
): UserConfig => {
  const {
    cwd = process.cwd(),
    entries = 'index.mts',
    srcDir = 'src',
  } = options;
  const files = castArray(entries).map((e) => resolve(cwd, srcDir, e));
  return mergeConfig(innerCreateConfig(files), overrides);
};
