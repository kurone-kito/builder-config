import type { execa as concretedExeca } from 'execa';
import { XSEA_PREFIX_ARGS } from '../constants.mts';
import type { Task } from './createTaskFactory.mjs';

/**
 * Create a Listr task for linking the SEA binary.
 * @param execa The implementation of `execa` to use for running commands.
 * @param targets  Target platform strings.
 * @param basename Output file base name.
 * @param nodeVersion Resolved Node.js version forwarded to xsea as `-N`.
 * @returns Listr task object.
 */
export const createSeaTask = (
  execa: typeof concretedExeca,
  targets: readonly string[],
  basename: string,
  nodeVersion: string,
): Task => {
  const additionalArgs = targets.flatMap((t) => ['-t', t]);
  const args = [
    ...XSEA_PREFIX_ARGS,
    `sea/${basename}`,
    '-N',
    nodeVersion,
    ...additionalArgs,
  ];
  return {
    title: 'Linking the SEA binary',
    task: () => execa('pnpm', args, { stdio: 'inherit' }),
  };
};
