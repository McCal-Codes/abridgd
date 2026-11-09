import { compareAreas } from "./areas";
import { EVENTS_WINDOW_DAYS } from "./eventsRepository";
import { addDaysToDate, formatShortDay, getEasternParts, weekdayOfDate } from "./time";
import { AppEvent } from "./types";

export type EventFilter =
  | { kind: "all" }
  | { kind: "today" }
  | { kind: "weekend" }
  | { kind: "area"; area: string };

export const ALL_FILTER: EventFilter = { kind: "all" };

export interface DayGroup {
  /** The date this group is shown under, `YYYY-MM-DD`. */
  date: string;
  /** "Today · Thu, Nov 5", "Tomorrow · Fri, Nov 6", or "Sat, Nov 7". */
  label: string;
  events: AppEvent[];
}

export interface FilterChip {
  filter: EventFilter;
  label: string;
}

/** The date an event is listed under: its own day, or today for something already under way. */
export const displayDateOf = (event: AppEvent, today: string): string =>
  event.localDate < today ? today : event.localDate;

/**
 * Events that are still relevant, inside the 14-day window, once each, in time order.
 * An event that has ended is dropped; one that started earlier but is still on (an exhibit, an
 * all-day happening) stays and is listed under today.
 */
export const selectUpcoming = (events: readonly AppEvent[], now: number): AppEvent[] => {
  const today = getEasternParts(now).date;
  const lastDay = addDaysToDate(today, EVENTS_WINDOW_DAYS - 1);
  const seen = new Set<string>();

  return events
    .filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return endOf(event) >= now && event.localDate <= lastDay;
    })
    .sort(
      (a, b) =>
        displayDateOf(a, today).localeCompare(displayDateOf(b, today)) ||
        Number(b.allDay) - Number(a.allDay) ||
        a.startsAt - b.startsAt ||
        a.title.localeCompare(b.title),
    );
};

const endOf = (event: AppEvent): number =>
  event.endsAt ?? event.startsAt + (event.allDay ? 24 * 3600_000 : 2 * 3600_000);

/** Whether an event is over. Saved events are kept for a while after this (see SAVED_EVENT_GRACE_MS). */
export const isEventEnded = (event: AppEvent, now: number): boolean => endOf(event) < now;

const isWeekend = (date: string) => {
  const day = weekdayOfDate(date);
  return day === 0 || day === 6;
};

export const applyFilter = (events: readonly AppEvent[], filter: EventFilter, now: number): AppEvent[] => {
  const today = getEasternParts(now).date;
  switch (filter.kind) {
    case "all":
      return [...events];
    case "today":
      return events.filter((e) => displayDateOf(e, today) === today);
    case "weekend":
      return events.filter((e) => isWeekend(displayDateOf(e, today)));
    case "area":
      return events.filter((e) => e.area === filter.area);
  }
};

const dayLabel = (date: string, today: string): string => {
  if (date === today) return `Today · ${formatShortDay(date)}`;
  if (date === addDaysToDate(today, 1)) return `Tomorrow · ${formatShortDay(date)}`;
  return formatShortDay(date);
};

export const groupByDay = (events: readonly AppEvent[], now: number): DayGroup[] => {
  const today = getEasternParts(now).date;
  const groups = new Map<string, AppEvent[]>();
  for (const event of events) {
    const date = displayDateOf(event, today);
    const list = groups.get(date);
    if (list) list.push(event);
    else groups.set(date, [event]);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({ date, label: dayLabel(date, today), events: list }));
};

/**
 * The filter chips for what is actually listed. "All" always; "Today" and "This weekend" only
 * when they would show something; then one chip per area that has events, in a stable
 * geographic order. Nothing here is hard-coded, so a new source in a new part of town adds its
 * own chip and an empty area never shows one.
 */
export const buildFilterChips = (events: readonly AppEvent[], now: number): FilterChip[] => {
  const chips: FilterChip[] = [{ filter: ALL_FILTER, label: "All" }];
  if (applyFilter(events, { kind: "today" }, now).length > 0) {
    chips.push({ filter: { kind: "today" }, label: "Today" });
  }
  if (applyFilter(events, { kind: "weekend" }, now).length > 0) {
    chips.push({ filter: { kind: "weekend" }, label: "This weekend" });
  }
  const areas = Array.from(new Set(events.map((e) => e.area))).sort(compareAreas);
  // A single-area list gains nothing from an area chip.
  if (areas.length > 1) {
    areas.forEach((area) => chips.push({ filter: { kind: "area", area }, label: area }));
  }
  return chips;
};

export const filtersEqual = (a: EventFilter, b: EventFilter): boolean =>
  a.kind === b.kind && (a.kind !== "area" || a.area === (b as { area: string }).area);

/** The few events the Home card shows: the soonest, one per organizer first so it is not a wall
 * of a single source. */
export const pickHomeEvents = (events: readonly AppEvent[], count: number): AppEvent[] => {
  const picked: AppEvent[] = [];
  const usedSources = new Set<string>();
  for (const event of events) {
    if (picked.length >= count) break;
    if (usedSources.has(event.sourceId)) continue;
    usedSources.add(event.sourceId);
    picked.push(event);
  }
  for (const event of events) {
    if (picked.length >= count) break;
    if (!picked.includes(event)) picked.push(event);
  }
  return picked.sort((a, b) => events.indexOf(a) - events.indexOf(b));
};

export interface SavedEventGroups {
  /** Saved events still to come (or under way), grouped by day, soonest first. No 14-day limit. */
  upcoming: DayGroup[];
  /** Saved events that are over, most recent first. */
  ended: AppEvent[];
}

/** Splits the saved collection for the Saved view: what is still ahead, and what has ended. */
export const groupSavedEvents = (saved: readonly AppEvent[], now: number): SavedEventGroups => {
  const seen = new Set<string>();
  const unique = saved.filter((event) => !seen.has(event.id) && !!seen.add(event.id));
  const today = getEasternParts(now).date;
  const ahead = unique
    .filter((event) => !isEventEnded(event, now))
    .sort(
      (a, b) =>
        displayDateOf(a, today).localeCompare(displayDateOf(b, today)) ||
        Number(b.allDay) - Number(a.allDay) ||
        a.startsAt - b.startsAt ||
        a.title.localeCompare(b.title),
    );
  const ended = unique.filter((event) => isEventEnded(event, now)).sort((a, b) => b.startsAt - a.startsAt);
  return { upcoming: groupByDay(ahead, now), ended };
};
