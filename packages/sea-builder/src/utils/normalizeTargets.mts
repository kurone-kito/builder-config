/**
 * Normalize target list for SEA build.
 *
 * When {@link targets} is empty, this function falls back to the current
 * {@link platform} and {@link arch} to create a single target string.
 * @param targets Target strings such as `linux-x64`.
 * @param platform Host platform name.
 * @param arch Host architecture name.
 * @returns Normalized target array.
 */
export const normalizeTargets = (
  targets: readonly string[],
  platform: NodeJS.Platform,
  arch: string,
): readonly string[] =>
  targets.length ? [...targets] : [`${platform}-${arch}` as const];
