import type { MajorNodeVersion } from 'all-node-versions';

/**
 * Convert a version specification to a semver range.
 * @param spec Version specification, e.g. `20`, `20.11`, `22.1.0`, etc.
 * @param versions Object containing available Node.js versions.
 * @returns Semver range string, e.g. `^20`, `~20.11`, etc.
 */
export const toSemver = (
  spec?: string | undefined,
  majors: readonly Pick<MajorNodeVersion, 'lts' | 'major'>[] = [],
): string => {
  if (!spec) {
    const ver = majors.filter(({ lts }) => lts).at(-1)?.major;
    return ver ? `^${ver}` : '*';
  }
  if (/^\d+\.\d+$/.test(spec)) {
    return `~${spec}`;
  }
  if (/^\d+$/.test(spec)) {
    return `^${spec}`;
  }
  return spec;
};
