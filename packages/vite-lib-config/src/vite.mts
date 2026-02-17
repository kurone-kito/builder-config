import { existsSync, readFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
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
   * Enable that builds for SEA (Single Executable Application).
   *
   * If enabled, the build will bundle all dependencies into a single file.
   * @default false
   */
  readonly sea?: boolean | undefined;

  /**
   * Directory where the source files are located.
   * @default 'src'
   */
  readonly srcDir?: string | undefined;

  /**
   * Target environments for the build, specified as an array of strings.
   * Each string can represent a specific environment or a version, such as
   * 'node20.20' or 'es2023'. These targets will be used to determine the
   * appropriate JavaScript features and syntax to include in the output.
   * @default ['node20.20', 'es2023']
   */
  readonly target?: Arrayable<string> | undefined;
}

/** The name of the output file. */
const out = '[name].mjs';

/** Static configuration for Vite builds. */
const staticConfig = {
  build: {
    rolldownOptions: {
      output: { chunkFileNames: out, entryFileNames: out, format: 'es' },
    },
    sourcemap: true,
    ssr: true,
  },
} as const satisfies UserConfig;

/** Static configuration for SEA builds. */
const staticSeaConfig = {
  build: {
    rolldownOptions: {
      external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
      output: {
        codeSplitting: false,
        entryFileNames: 'index.cjs',
        format: 'cjs',
        inlineDynamicImports: true,
      },
      plugins: [nodeResolve({ preferBuiltins: true })],
    },
  },
  ssr: { noExternal: true },
} as const satisfies UserConfig;

/**
 * Creates a Vite configuration based on the provided entry point.
 *
 * The entry point is `src/index.mts` under the provided working directory.
 * If the file starts with a shebang(`#!...`), the build uses library mode;
 * otherwise it performs an SSR build.
 * @param entries Entry point files for the Vite configuration.
 * @param target Target environments for the build.
 * @return A Vite {@link UserConfig} object with the configuration
 */
const innerCreateConfig = (
  entries: readonly string[],
  target: Arrayable<string>,
): UserConfig => {
  const entry = entries.filter((f) => existsSync(f));
  if (!entry.length) {
    return {};
  }
  const bin = entry.every((f) => shebangRegex.test(readFileSync(f, 'utf8')));
  return mergeConfig<UserConfig, UserConfig>(staticConfig, {
    build: {
      rollupOptions: { input: entry },
      ...(bin ? {} : { lib: { entry, formats: ['es'] } }),
      target,
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
    sea,
    srcDir = 'src',
    target = ['node20.20', 'es2023'],
  } = options;
  const files = castArray(entries).map((e) => resolve(cwd, srcDir, e));
  return mergeConfig(
    innerCreateConfig(files, target),
    mergeConfig(sea ? staticSeaConfig : {}, overrides),
  );
};
