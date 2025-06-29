import type { execa as concretedExeca } from 'execa';
import type { Task } from './createTaskFactory.mjs';

/**
 * Create a Listr task for building the project.
 * @param execa The implementation of `execa` to use for running commands.
 * @returns Listr task object.
 */
export const createBuildTask = (execa: typeof concretedExeca): Task => ({
  title: 'Build',
  task: () => execa('pnpm', ['run', 'build'], { stdio: 'inherit' }),
});
