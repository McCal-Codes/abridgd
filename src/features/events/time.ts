/**
 * Small, dependency-free Eastern-time helpers.
 *
 * Event listings publish wall-clock times in America/New_York. Converting them to an exact
 * instant (for the calendar) and deciding what "today" means for a Pittsburgh reader both need
 * the zone's UTC offset. `Intl` gives it when the runtime supports time zones; the fallback is
 * the fixed US rule (DST from the second Sunday in March to the first Sunday in November), so
 * the answer is right even where `Intl` time-zone support is missing or incomplete.
 */

export const EVENT_TIME_ZONE = "America/New_York";

const pad = (n: number) => String(n).padStart(2, "0");

/** Day of month of the nth Sunday (1-based) of a month, `month` 1-12. */
const nthSunday = (year: number, month: number, n: number): number => {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 = Sunday
  const firstSunday = 1 + ((7 - firstDow) % 7);
  return firstSunday + (n - 1) * 7;
};

/** US Eastern UTC offset in ms for an instant, by rule. -5h standard, -4h daylight. */
export const easternOffsetByRule = (utcMs: number): number => {
  const year = new Date(utcMs).getUTCFullYear();
  // DST starts 2:00 local standard time (07:00 UTC) on the second Sunday of March and ends
  // 2:00 local daylight time (06:00 UTC) on the first Sunday of November.
  const start = Date.UTC(year, 2, nthSunday(year, 3, 2), 7);
  const end = Date.UTC(year, 10, nthSunday(year, 11, 1), 6);
  return utcMs >= start && utcMs < end ? -4 * 3600_000 : -5 * 3600_000;
};

const offsetViaIntl = (utcMs: number, timeZone: string): number | null => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date(utcMs));
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const asUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour") % 24,
      get("minute"),
      get("second"),
    );
    if (!Number.isFinite(asUtc)) return null;
    return asUtc - Math.floor(utcMs / 1000) * 1000;
  } catch {
    return null;
  }
};

export const easternOffsetMs = (utcMs: number): number =>
  offsetViaIntl(utcMs, EVENT_TIME_ZONE) ?? easternOffsetByRule(utcMs);

/** Eastern wall-clock fields to a UTC instant. Resolves the DST gap/overlap deterministically. */
export const easternWallTimeToUtcMs = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number => {
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);
  const first = asIfUtc - easternOffsetMs(asIfUtc);
  const second = asIfUtc - easternOffsetMs(first);
  return second;
};

export interface EasternParts {
  /** `YYYY-MM-DD` */
  date: string;
  /** 0 = Sunday */
  weekday: number;
  hour: number;
  minute: number;
}

/** The Eastern calendar date and clock for a UTC instant. */
export const getEasternParts = (utcMs: number): EasternParts => {
  const shifted = new Date(utcMs + easternOffsetMs(utcMs));
  return {
    date: `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`,
    weekday: shifted.getUTCDay(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
};

/** `YYYY-MM-DD` plus whole days, calendar arithmetic only (no time zone involved). */
export const addDaysToDate = (date: string, days: number): string => {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
};

/** Weekday (0 = Sunday) of a `YYYY-MM-DD` date. */
export const weekdayOfDate = (date: string): number => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const monthDay = (date: string): string => {
  const [, m, d] = date.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${d}`;
};

export const weekdayShort = (date: string): string => WEEKDAYS_SHORT[weekdayOfDate(date)];

/** "Sat, Nov 7". */
export const formatShortDay = (date: string): string => `${weekdayShort(date)}, ${monthDay(date)}`;

/** "Saturday, Nov 7". */
export const formatLongDay = (date: string): string =>
  `${WEEKDAYS_LONG[weekdayOfDate(date)]}, ${monthDay(date)}`;

/** `HH:mm` to "1:00 PM". */
export const formatClock = (hhmm: string): string => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${suffix}`;
};

/** Parses "1:00 PM" / "10:01 AM" to `HH:mm`, or null. */
export const parseClock12 = (value: string | null | undefined): string | null => {
  const match = /^\s*(\d{1,2}):(\d{2})\s*([AP]M)\s*$/i.exec(value ?? "");
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return `${pad(hour)}:${match[2]}`;
};
