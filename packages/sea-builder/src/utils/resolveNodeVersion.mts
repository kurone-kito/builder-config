import type { SemverVersion } from 'all-node-versions';
import allNodeVersions from 'all-node-versions';
import { rcompare, satisfies } from 'semver';
import { filterSupportedLts } from './filterSupportedLts.mjs';
import { toSemver } from './toSemver.mjs';

/**
 * Resolve Node.js version from a version specification.
 * @param spec Version specification, e.g. `20`, `20.11`, `22.1.0`, etc.
 * If not specified, the latest patch version of the oldest currently
 * supported LTS line is used.
 * @param now Current time, used to determine which LTS lines are still
 * within their support window. Defaults to the real current time; only
 * meant to be overridden in tests.
 * @returns Resolved Node.js version, e.g. `v20.12.0`.
 */
export const resolveNodeVersion = async (
  spec?: string | undefined,
  now: Date = new Date(),
): Promise<`v${SemverVersion}`> => {
  const { majors, versions } = await allNodeVersions({ fetch: false });
  // toSemver only consults majors for its spec-absent branch, so skip
  // filtering it against node-releases' schedule when spec is given.
  const supportedLts = spec ? [] : filterSupportedLts(majors, now);
  if (!spec && supportedLts.length === 0) {
    throw new Error(
      'No currently-supported LTS line found in the bundled node-releases schedule data; it may be stale. Try updating dependencies, or pass an explicit --node version.',
    );
  }
  const range = toSemver(spec, supportedLts);
  const resolved = versions
    .map(({ node }) => node)
    .filter((v) => satisfies(v, range))
    .sort(rcompare)[0];
  if (!resolved) {
    throw new Error(`Unsupported Node.js version: ${spec ?? ''}`);
  }
  return `v${resolved}`;
};
