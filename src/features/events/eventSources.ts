import { EventSource } from "./types";

/**
 * Where events come from. All of these are public listings read without an account or a key,
 * straight from the organizer, and each event links back to the organizer's own page.
 *
 * Most Pittsburgh organizers publish with WordPress' The Events Calendar plugin, which exposes
 * a documented JSON endpoint (`/wp-json/tribe/events/v1/events`). One parser therefore covers
 * every `tribe` source, so adding another organizer is a config entry, not new code. The City of
 * Pittsburgh posts council and committee meetings through Legistar's public API.
 *
 * Health notes carry a date and what was actually observed, like `feedConfig.ts`. Re-check with
 * `npm run audit:events` before enabling anything new.
 */
export const EVENT_SOURCES: EventSource[] = [
  {
    id: "city-meetings",
    name: "City of Pittsburgh",
    kind: "legistar",
    baseUrl: "https://webapi.legistar.com/v1/pittsburgh",
    defaultArea: "Downtown & Strip",
    health: "healthy",
    healthNote:
      "2026-11-05: Events endpoint returned meetings with no key (6 in a 2-week window). Other Legistar endpoints (Bodies) require a token, so only Events is used.",
  },
  {
    id: "kidsburgh",
    name: "Kidsburgh",
    kind: "tribe",
    baseUrl: "https://www.kidsburgh.org",
    health: "healthy",
    healthNote: "2026-11-05: JSON API 200, 102 events in a 2-week window, venue and ZIP present.",
  },
  {
    id: "wqed",
    name: "WQED",
    kind: "tribe",
    baseUrl: "https://www.wqed.org",
    health: "healthy",
    healthNote: "2026-11-05: JSON API 200, 58 events in a 2-week window, categories present.",
  },
  {
    id: "bloomfield",
    name: "Bloomfield Development Corporation",
    kind: "tribe",
    baseUrl: "https://www.bloomfieldpgh.org",
    defaultArea: "Lawrenceville & Bloomfield",
    health: "healthy",
    healthNote: "2026-11-05: JSON API 200, 2 events in a 2-week window (community meetings, no venue given).",
  },
  {
    id: "parks",
    name: "Pittsburgh Parks Conservancy",
    kind: "tribe",
    baseUrl: "https://pittsburghparks.org",
    health: "healthy",
    healthNote: "2026-11-05: JSON API 200, 7 events in a 2-week window.",
  },
  {
    id: "heinz-history",
    name: "Heinz History Center",
    kind: "tribe",
    baseUrl: "https://www.heinzhistorycenter.org",
    defaultArea: "Downtown & Strip",
    defaultVenue: "Heinz History Center",
    health: "healthy",
    healthNote: "2026-11-05: JSON API 200, 8 events in a 2-week window; no venue on events.",
  },
  {
    id: "carnegie-museums",
    name: "Carnegie Museums",
    kind: "tribe",
    baseUrl: "https://www.carnegiemuseums.org",
    health: "healthy",
    healthNote:
      "2026-11-05: JSON API reachable (request without the www redirect returns 301, so fetch must follow redirects).",
  },
];

export const getEnabledEventSources = (): EventSource[] =>
  EVENT_SOURCES.filter((source) => source.defaultEnabled !== false && source.health === "healthy");
