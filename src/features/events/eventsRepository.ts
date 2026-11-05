import { fetchWithTimeout } from "../../services/feed/transport";
import {
  ensureEventsHydrated,
  getAllEventsSnapshots,
  getEventsSnapshot,
  touchEventsAttempt,
  writeEventsSnapshot,
} from "./eventsCache";
import { getEnabledEventSources } from "./eventSources";
import { parseLegistarResponse, parseTribeResponse } from "./parsers";
import { addDaysToDate, getEasternParts } from "./time";
import { AppEvent, EventSource } from "./types";

/** Listings change slowly; two hours keeps the list fresh without hammering small organizers'
 * servers. Pull-to-refresh bypasses it. */
export const EVENTS_SOFT_TTL_MS = 2 * 60 * 60 * 1000;
/** How far ahead the list looks. The screen promises "next 14 days" and ends there. */
export const EVENTS_WINDOW_DAYS = 14;
const MAX_TRIBE_PAGES = 3;

const inFlight = new Map<string, Promise<void>>();

export interface EventsLoadResult {
  events: AppEvent[];
  /** Sources whose last attempt failed (their last good events are still in `events`). */
  failedSources: string[];
  /** Oldest successful fetch among the sources contributing events, or null. */
  lastUpdated: number | null;
  /** True when at least one source is older than the soft TTL (or has never loaded). */
  stale: boolean;
}

const sameOrigin = (url: string, base: string): boolean => {
  const origin = (value: string) => /^https:\/\/([^/?#]+)/i.exec(value)?.[1]?.toLowerCase();
  return origin(url) !== undefined && origin(url) === origin(base);
};

const fetchJson = async (url: string): Promise<unknown> => {
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const buildTribeUrl = (source: EventSource, startDate: string, endDate: string): string =>
  `${source.baseUrl}/wp-json/tribe/events/v1/events?per_page=50&start_date=${startDate}&end_date=${endDate}`;

export const buildLegistarUrl = (source: EventSource, startDate: string, endDate: string): string => {
  const filter = `EventDate ge datetime'${startDate}' and EventDate lt datetime'${endDate}'`;
  return `${source.baseUrl}/Events?$filter=${encodeURIComponent(filter)}&$orderby=${encodeURIComponent("EventDate asc")}`;
};

/** Fetches and parses one source. Throws on a network or HTTP failure. */
export const fetchSourceEvents = async (source: EventSource, now: number): Promise<AppEvent[]> => {
  const today = getEasternParts(now).date;
  // Start a day early and end a day late so timezone edges never clip a real event.
  const startDate = addDaysToDate(today, -1);
  const endDate = addDaysToDate(today, EVENTS_WINDOW_DAYS + 1);

  if (source.kind === "legistar") {
    return parseLegistarResponse(await fetchJson(buildLegistarUrl(source, startDate, endDate)), source);
  }

  const events: AppEvent[] = [];
  let url: string | undefined = buildTribeUrl(source, startDate, endDate);
  for (let page = 0; url && page < MAX_TRIBE_PAGES; page++) {
    const json = await fetchJson(url);
    events.push(...parseTribeResponse(json, source));
    const next: unknown = (json as { next_rest_url?: unknown })?.next_rest_url;
    // Only follow a next link that stays on the organizer's own site.
    url = typeof next === "string" && sameOrigin(next, source.baseUrl) ? next : undefined;
  }
  return events;
};

const refreshSource = (source: EventSource, now: number): Promise<void> => {
  const existing = inFlight.get(source.id);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const events = await fetchSourceEvents(source, now);
      await writeEventsSnapshot({
        sourceId: source.id,
        events,
        fetchedAt: now,
        attemptedAt: now,
        schemaVersion: 1,
      });
    } catch (error) {
      console.warn(`Events fetch failed for ${source.name}`, error);
      await touchEventsAttempt(source.id, now);
      throw error;
    }
  })().finally(() => {
    inFlight.delete(source.id);
  });

  inFlight.set(source.id, promise);
  return promise;
};

const collect = (sources: EventSource[], now: number, failed: string[]): EventsLoadResult => {
  const events: AppEvent[] = [];
  let oldest: number | null = null;
  let stale = false;

  for (const source of sources) {
    const snapshot = getEventsSnapshot(source.id);
    if (!snapshot) {
      stale = true;
      continue;
    }
    events.push(...snapshot.events);
    oldest = oldest === null ? snapshot.fetchedAt : Math.min(oldest, snapshot.fetchedAt);
    // Judge staleness from the last *attempt*, so a permanently broken source cannot keep the
    // whole screen flagged stale by failing every time.
    if (now - snapshot.attemptedAt > EVENTS_SOFT_TTL_MS) stale = true;
  }

  return { events, failedSources: failed, lastUpdated: oldest, stale };
};

/** Cached events only, never touching the network. Call after `ensureEventsHydrated`. */
export const getCachedEvents = (now: number = Date.now()): EventsLoadResult =>
  collect(getEnabledEventSources(), now, []);

export class EventsLoadError extends Error {
  constructor(message = "Couldn't load events") {
    super(message);
    this.name = "EventsLoadError";
  }
}

/**
 * Refreshes whichever sources are stale (all of them when `force`), in parallel, and returns the
 * merged result. One organizer being down never blanks the list: its last good events stay.
 * Throws `EventsLoadError` only when nothing at all could be shown.
 */
export const loadEvents = async (
  options: { force?: boolean; now?: number } = {},
): Promise<EventsLoadResult> => {
  const now = options.now ?? Date.now();
  await ensureEventsHydrated();
  const sources = getEnabledEventSources();

  const due = sources.filter((source) => {
    if (options.force) return true;
    const snapshot = getEventsSnapshot(source.id);
    return !snapshot || now - snapshot.attemptedAt > EVENTS_SOFT_TTL_MS;
  });

  const settled = await Promise.allSettled(due.map((source) => refreshSource(source, now)));
  const failed = due.filter((_, index) => settled[index].status === "rejected").map((s) => s.name);

  const result = collect(sources, now, failed);
  if (result.events.length === 0 && getAllEventsSnapshots().length === 0 && failed.length > 0) {
    throw new EventsLoadError();
  }
  return result;
};
