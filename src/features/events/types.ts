/**
 * A single local event, normalised from any source. Times are kept two ways on purpose:
 *
 * - `startsAt` / `endsAt` are UTC epoch ms. They drive sorting, the "is it still on" check and
 *   the calendar hand-off, where an exact instant matters.
 * - `localDate` / `localTime` are the wall-clock values exactly as the organizer published them
 *   (America/New_York). They drive display and day grouping, so a listing reads the same on any
 *   device and never depends on the phone's time zone or on Intl support.
 */
export interface AppEvent {
  /** `<sourceId>:<id in that source>`. Stable across refreshes, so saves survive. */
  id: string;
  title: string;
  startsAt: number;
  endsAt?: number;
  allDay: boolean;
  /** `YYYY-MM-DD` in America/New_York. */
  localDate: string;
  /** `HH:mm` (24h) in America/New_York; absent for all-day events. */
  localTime?: string;
  endLocalTime?: string;
  venue?: string;
  /** One-line street address, when the source gives one. */
  address?: string;
  /** Derived area label (see `areas.ts`), or "Online". Never null: unknown places are "Pittsburgh". */
  area: string;
  category?: string;
  cost?: string;
  /** Plain-text summary, a few sentences at most. */
  summary?: string;
  /** The organizer's own page for this event. Always http(s). */
  url: string;
  sourceId: string;
  sourceName: string;
}

export type EventSourceKind = "tribe" | "legistar";

export type EventSourceHealth = "healthy" | "pending-replacement" | "experimental-off";

export interface EventSource {
  id: string;
  name: string;
  kind: EventSourceKind;
  /** Site origin for `tribe`; Legistar client API base for `legistar`. No trailing slash. */
  baseUrl: string;
  /** Used when an event carries no usable place of its own (a host that always meets in one area). */
  defaultArea?: string;
  /** Optional venue label for sources whose events never name one. */
  defaultVenue?: string;
  defaultEnabled?: boolean;
  health: EventSourceHealth;
  /** Dated, specific: what was observed and when. Same convention as `FeedSource.healthNote`. */
  healthNote?: string;
}

export interface EventsSnapshot {
  sourceId: string;
  events: AppEvent[];
  fetchedAt: number;
  attemptedAt: number;
  schemaVersion: 1;
}
