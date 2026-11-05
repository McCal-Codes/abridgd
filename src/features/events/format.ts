import { formatClock, formatLongDay, monthDay, weekdayShort } from "./time";
import { AppEvent } from "./types";

/** "10:30 AM", "All day", or "10:30 AM to 11:30 AM" for the detail view. */
export const formatEventTime = (event: AppEvent, withEnd = false): string => {
  if (event.allDay || !event.localTime) return "All day";
  const start = formatClock(event.localTime);
  return withEnd && event.endLocalTime ? `${start} to ${formatClock(event.endLocalTime)}` : start;
};

/** Where it is, in one line: the venue, else the area. */
export const formatEventPlace = (event: AppEvent): string => {
  if (event.area === "Online") return "Online";
  return event.venue || event.area;
};

export const formatEventWhen = (event: AppEvent): string =>
  `${formatLongDay(event.localDate)} · ${formatEventTime(event, true)}`;

/** The date block on a Home row: weekday and day number. */
export const dateBlockParts = (event: AppEvent): { weekday: string; day: string } => ({
  weekday: weekdayShort(event.localDate).toUpperCase(),
  day: monthDay(event.localDate).split(" ")[1],
});

/** One spoken sentence for the whole card, so a screen reader gets it in a single focus stop. */
export const describeEvent = (event: AppEvent, saved: boolean): string =>
  [
    event.title,
    formatLongDay(event.localDate),
    formatEventTime(event, true),
    formatEventPlace(event),
    `Listed by ${event.sourceName}`,
    saved ? "Saved" : null,
  ]
    .filter(Boolean)
    .join(", ");
