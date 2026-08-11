import type { MajorNodeVersion } from 'all-node-versions';
import releaseSchedule from 'node-releases/data/release-schedule/release-schedule.json' with {
  type: 'json',
};

/** A single major's entry in node-releases' release schedule data. */
interface ScheduleEntry {
  /** ISO date the major's support window ends, if scheduled. */
  readonly end?: string;

  /** ISO date the major entered LTS, if it ever did. */
  readonly lts?: string;
}

/**
 * Filter out majors whose LTS support window has already ended, per
 * `node-releases`' release schedule. `all-node-versions`' own `lts` flag
 * marks every major that *ever* had an LTS codename, going back to Node 4
 * — this narrows that down to the ones still within their scheduled
 * support window.
 * @param majors Majors to filter.
 * @param now Current time, used to determine end-of-life status.
 * @returns Majors that are LTS and not yet past their scheduled `end` date.
 */
export const filterSupportedLts = <
  T extends Pick<MajorNodeVersion, 'lts' | 'major'>,
>(
  majors: readonly T[],
  now: Date = new Date(),
): readonly T[] =>
  majors.filter(({ lts, major }) => {
    if (!lts) {
      return false;
    }
    const entry = (releaseSchedule as Record<string, ScheduleEntry>)[
      `v${major}`
    ];
    if (!entry?.lts || !entry.end) {
      return false;
    }
    // `entry.end` is a date-only string (e.g. "2026-04-30"), which
    // Date parses as that day's UTC midnight; add a day so the entire
    // end date itself still counts as supported.
    const endOfSupportWindow = new Date(entry.end).getTime() + 86_400_000;
    return endOfSupportWindow > now.getTime();
  });
