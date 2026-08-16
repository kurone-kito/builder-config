/**
 * Map a single `<platform>-<arch>` token onto nodejs.org archive names.
 *
 * Already-canonical names are a no-op so a second pass (for example
 * `normalizeCacheOptions` re-entering through `createListrCacheTasks`)
 * does not rewrite them again.
 * @param target Target string such as `win32-x64` or `linux-arm`.
 * @returns The nodejs.org archive target, e.g. `win-x64`.
 */
const toNodeArchiveTarget = (target: string): string => {
  const separator = target.lastIndexOf('-');
  if (separator === -1) {
    return target;
  }

  const platform = target.slice(0, separator);
  const arch = target.slice(separator + 1);
  const mappedPlatform = platform === 'win32' ? 'win' : platform;
  let mappedArch = arch;
  if (mappedPlatform === 'win' && arch === 'ia32') {
    mappedArch = 'x86';
  } else if (arch === 'arm') {
    mappedArch = 'armv7l';
  }
  return `${mappedPlatform}-${mappedArch}`;
};

/**
 * Normalize target list for SEA build.
 *
 * When {@link targets} is empty, this function falls back to the current
 * {@link platform} and {@link arch} to create a single target string.
 * Every returned token is then mapped onto nodejs.org archive vocabulary
 * (`win32` → `win`, Windows `ia32` → `x86`, `arm` → `armv7l`).
 * @param targets Target strings such as `linux-x64`.
 * @param platform Host platform name.
 * @param arch Host architecture name.
 * @returns Normalized target array.
 */
export const normalizeTargets = (
  targets: readonly string[],
  platform: NodeJS.Platform,
  arch: string,
): readonly string[] => {
  const raw = targets.length ? targets : [`${platform}-${arch}`];
  return raw.map(toNodeArchiveTarget);
};
