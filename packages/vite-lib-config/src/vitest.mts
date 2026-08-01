import type { ViteUserConfig } from 'vitest/config';
import { mergeConfig } from 'vitest/config';
import type { ViteConfigOptions } from './vite.mjs';
import { viteConfig } from './vite.mjs';

/** Static configuration for Vitest tests. */
const staticConfig = {
  test: { environment: 'node' },
} as const satisfies ViteUserConfig;

/**
 * Create a Vitest configuration for the current project.
 *
 * Merges a `test.environment: 'node'` default under the {@link viteConfig}
 * produced for the same entry point, so Vitest inherits the same build
 * settings the project builds with. Additional settings can override
 * these defaults via {@link mergeConfig}.
 * @param overrides Additional configuration options to merge with the base
 * config.
 * @param options Options for creating the config, including the working
 * directory.
 * @return A Vitest {@link ViteUserConfig} object with the merged
 * configuration.
 */
export const vitestConfig = (
  overrides: ViteUserConfig = {},
  options: ViteConfigOptions = {},
): ViteUserConfig => mergeConfig(staticConfig, viteConfig(overrides, options));
