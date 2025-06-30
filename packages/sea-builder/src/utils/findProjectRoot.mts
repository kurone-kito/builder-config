import { dirname, join } from 'node:path';
import type { ExistsSync } from './types.mjs';

/**
 * Find the project root by looking for package.json or node_modules.
 * @param startPath Starting directory path.
 * @param existsSync File existence check function.
 * @returns Project root directory path.
 */
export const findProjectRoot = (
  startPath: string,
  existsSync: ExistsSync,
): string => {
  let currentPath = startPath;
  let parentPath = dirname(currentPath);

  while (currentPath !== parentPath) {
    if (
      existsSync(join(currentPath, 'package.json')) ||
      existsSync(join(currentPath, 'node_modules'))
    ) {
      return currentPath;
    }
    currentPath = parentPath;
    parentPath = dirname(currentPath);
  }

  // If no project root is found, fall back to the starting path
  return startPath;
};
