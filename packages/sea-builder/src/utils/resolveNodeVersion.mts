import type { SemverVersion } from 'all-node-versions';
import allNodeVersions from 'all-node-versions';
import { rcompare, satisfies } from 'semver';
import { toSemver } from './toSemver.mjs';

/**
 * Resolve Node.js version from a version specification.
 * @param spec Version specification, e.g. `20`, `20.11`, `22.1.0`, etc.
 * If not specified, the latest patch version of the oldest LTS is used.
 * @returns Resolved Node.js version, e.g. `v20.12.0`.
 */
export const resolveNodeVersion = async (
  spec?: string | undefined,
): Promise<`v${SemverVersion}`> => {
  const { majors, versions } = await allNodeVersions({ fetch: false });
  const range = toSemver(spec, majors);
  const resolved = versions
    .map(({ node }) => node)
    .filter((v) => satisfies(v, range))
    .sort(rcompare)[0];
  if (!resolved) {
    throw new Error(`Unsupported Node.js version: ${spec ?? ''}`);
  }
  return `v${resolved}`;
};
