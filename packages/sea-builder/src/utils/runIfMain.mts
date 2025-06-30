import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Type definition for the main function executed when the module is run
 * as a script.
 */
export type MainFunction = (...args: readonly string[]) => Promise<void>;

/**
 * Execute the provided {@link main} function when the current module is
 * the entry point.
 * @param url Value of `import.meta.url` from the caller.
 * @param main Function executed with CLI arguments.
 */
export const runIfMain = (url: string, main: MainFunction): Promise<void> => {
  const [, bin = '', ...args] = process.argv;
  return realpathSync(bin) === fileURLToPath(url)
    ? main(...args)
    : Promise.resolve();
};
