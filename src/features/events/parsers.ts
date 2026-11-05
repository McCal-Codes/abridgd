import { decodeHtmlEntities } from "../../utils/htmlEntities";
import { resolveArea } from "./areas";
import { easternWallTimeToUtcMs, parseClock12 } from "./time";
import { AppEvent, EventSource } from "./types";

const SUMMARY_MAX_CHARS = 280;

/** Plain text from an HTML fragment: tags dropped, entities decoded, whitespace collapsed. */
export const htmlToPlainText = (html: unknown): string => {
  if (typeof html !== "string" || !html) return "";
  const withBreaks = html.replace(/<\s*(br|\/p|\/li|\/div|\/h[1-6])\s*\/?>/gi, " ");
  const stripped = withBreaks.replace(/<[^>]*>/g, " ");
  return decodeHtmlEntities(stripped).replace(/\s+/g, " ").trim();
};

const clip = (text: string, max: number): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, "")}…`;
};

const isHttpUrl = (value: unknown): value is string =>
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

/** "2026-11-05 19:00:00" -> { date, time } (both Eastern wall clock), or null. */
const splitLocal = (value: unknown): { date: string; time: string } | null => {
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/.exec(typeof value === "string" ? value : "");
  return match ? { date: match[1], time: `${match[2]}:${match[3]}` } : null;
};

const localToUtcMs = (date: string, time: string): number => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return easternWallTimeToUtcMs(y, m, d, hh, mm);
};

// ---------------------------------------------------------------------------------------------
// The Events Calendar (WordPress) JSON: /wp-json/tribe/events/v1/events
// ---------------------------------------------------------------------------------------------

interface TribeVenue {
  venue?: string;
  address?: string;
  city?: string;
  zip?: string;
  state?: string;
}

interface TribeEvent {
  id?: number | string;
  title?: string;
  url?: string;
  start_date?: string;
  end_date?: string;
  all_day?: boolean;
  cost?: string;
  description?: string;
  excerpt?: string;
  venue?: TribeVenue | unknown[];
  categories?: Array<{ name?: string }>;
}

export const parseTribeEvent = (raw: TribeEvent, source: EventSource): AppEvent | null => {
  const start = splitLocal(raw.start_date);
  const title = decodeHtmlEntities(asString(raw.title) ?? "").trim();
  const url = isHttpUrl(raw.url) ? raw.url.trim() : null;
  if (!start || !title || !url || raw.id === undefined) return null;

  const end = splitLocal(raw.end_date);
  const allDay = Boolean(raw.all_day);
  // The plugin returns `venue: []` (an empty array) when an event has no venue.
  const venue: TribeVenue =
    raw.venue && !Array.isArray(raw.venue) && typeof raw.venue === "object"
      ? (raw.venue as TribeVenue)
      : {};

  const venueName = decodeHtmlEntities(asString(venue.venue) ?? "") || source.defaultVenue;
  const street = decodeHtmlEntities(asString(venue.address) ?? "");
  const city = asString(venue.city);
  const state = asString(venue.state);
  const address = street ? [street, city, state].filter(Boolean).join(", ") : undefined;

  const startTime = allDay ? "00:00" : start.time;
  const startsAt = localToUtcMs(start.date, startTime);
  let endsAt: number | undefined;
  if (end) {
    endsAt = localToUtcMs(end.date, allDay ? "23:59" : end.time);
    if (endsAt < startsAt) endsAt = undefined;
  }

  const summary = clip(htmlToPlainText(raw.excerpt || raw.description), SUMMARY_MAX_CHARS);

  return {
    id: `${source.id}:${raw.id}`,
    title,
    startsAt,
    endsAt,
    allDay,
    localDate: start.date,
    localTime: allDay ? undefined : start.time,
    endLocalTime: allDay || !end || end.date !== start.date ? undefined : end.time,
    venue: venueName,
    address,
    area: resolveArea({
      zip: venue.zip,
      city,
      venue: venueName && venueName !== source.defaultVenue ? venueName : undefined,
      address: street,
      title,
      defaultArea: source.defaultArea,
    }),
    category: decodeHtmlEntities(asString(raw.categories?.[0]?.name) ?? "") || undefined,
    cost: asString(raw.cost),
    summary: summary || undefined,
    url,
    sourceId: source.id,
    sourceName: source.name,
  };
};

export interface TribeResponse {
  events?: TribeEvent[];
  next_rest_url?: string;
}

export const parseTribeResponse = (json: unknown, source: EventSource): AppEvent[] => {
  const events = (json as TribeResponse)?.events;
  if (!Array.isArray(events)) return [];
  return events.map((raw) => parseTribeEvent(raw, source)).filter((e): e is AppEvent => e !== null);
};

// ---------------------------------------------------------------------------------------------
// Legistar (City of Pittsburgh council and committee meetings)
// ---------------------------------------------------------------------------------------------

interface LegistarEvent {
  EventId?: number;
  EventBodyName?: string;
  EventDate?: string;
  EventTime?: string;
  EventLocation?: string | null;
  EventInSiteURL?: string;
  EventComment?: string | null;
}

export const parseLegistarEvent = (raw: LegistarEvent, source: EventSource): AppEvent | null => {
  const date = /^(\d{4}-\d{2}-\d{2})/.exec(raw.EventDate ?? "")?.[1];
  const time = parseClock12(raw.EventTime);
  const title = (raw.EventBodyName ?? "").replace(/\s+/g, " ").trim();
  const url = isHttpUrl(raw.EventInSiteURL) ? raw.EventInSiteURL.trim() : null;
  if (!date || !time || !title || !url || raw.EventId === undefined) return null;

  const location = asString(raw.EventLocation);
  const comment = asString(raw.EventComment);

  return {
    id: `${source.id}:${raw.EventId}`,
    title: /meeting|council|committee|hearing|briefing/i.test(title) ? title : `${title} meeting`,
    startsAt: localToUtcMs(date, time),
    allDay: false,
    localDate: date,
    localTime: time,
    venue: location ? `City-County Building, ${location}` : "City-County Building",
    address: "414 Grant St, Pittsburgh, PA",
    area: source.defaultArea ?? "Downtown & Strip",
    category: "Civic",
    cost: "Free",
    summary: comment ? clip(comment, SUMMARY_MAX_CHARS) : undefined,
    url,
    sourceId: source.id,
    sourceName: source.name,
  };
};

/**
 * Legistar lists a full council meeting once per agenda revision: the same body and date can
 * appear twice a minute apart ("City Council" at 10:00 and 10:01). Keep one per body and day.
 */
export const parseLegistarResponse = (json: unknown, source: EventSource): AppEvent[] => {
  if (!Array.isArray(json)) return [];
  const seen = new Set<string>();
  const out: AppEvent[] = [];
  for (const raw of json as LegistarEvent[]) {
    const event = parseLegistarEvent(raw, source);
    if (!event) continue;
    const key = `${event.title.toLowerCase()}|${event.localDate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(event);
  }
  return out;
};
