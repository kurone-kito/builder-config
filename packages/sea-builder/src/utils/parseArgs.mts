import type { ParseArgsConfig } from 'node:util';
import { parseArgs as innerParseArgs } from 'node:util';

/** Type definition for parsed CLI arguments. */
export interface HelpParsedArgs {
  /** Indicates that help was requested. */
  readonly help: true;
}

/** Type definition for parsed CLI arguments. */
export interface TargetsParsedArgs {
  /** The base name for the output file. */
  readonly basename: string;

  /** Indicates that help was not requested. */
  readonly help: false;

  /** Node.js version specification. */
  readonly nodeVersion?: string | undefined;

  /** A list of target platforms. */
  readonly targets: readonly string[];
}

/** Static configuration for CLI argument parsing. */
const staticConfig = {
  allowPositionals: true,
  options: {
    help: { default: false, short: 'h', type: 'boolean' },
    node: { type: 'string' },
    targets: { type: 'string' },
  },
} as const satisfies ParseArgsConfig;

/**
 * Parse CLI arguments into options for {@link run}.
 * @param argv CLI arguments.
 * @returns Parsed values.
 */
export const parseArgs = (
  argv: readonly string[],
): HelpParsedArgs | TargetsParsedArgs => {
  const {
    values,
    positionals: [basename],
  } = innerParseArgs({ ...staticConfig, args: [...argv] });
  if (values.help) {
    return { help: true };
  }
  if (!basename) {
    throw new Error('Output file base name is required');
  }
  const { node: nodeVersion, targets: rawTargets } = values;
  const targets = rawTargets?.split(',').filter(Boolean) ?? [];
  return { basename, help: false, nodeVersion, targets };
};
