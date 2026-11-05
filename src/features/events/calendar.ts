import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import { openExternalUrl } from "../../utils/openExternalUrl";
import { EVENT_TIME_ZONE, addDaysToDate, easternWallTimeToUtcMs, getEasternParts } from "./time";
import { AppEvent } from "./types";

const DEFAULT_DURATION_MS = 60 * 60 * 1000;

export type AddToCalendarResult =
  /** The OS add-event screen reported the event was saved (iOS). */
  | "saved"
  /** The user closed the add-event screen without saving (iOS). */
  | "canceled"
  /** The OS add-event screen was shown. Android does not say whether the user saved. */
  | "shown"
  /** No native calendar UI was available, so a calendar link was opened in the browser. */
  | "link"
  | "failed";

const location = (event: AppEvent): string | undefined => {
  const parts = [event.venue, event.address].filter((p): p is string => Boolean(p));
  // Avoid "Hall, Hall" when the venue name already is the address.
  return parts.length > 1 && parts[1].startsWith(parts[0]) ? parts[1] : parts.join(", ") || undefined;
};

const notes = (event: AppEvent): string =>
  [event.summary, `Details: ${event.url}`, `Listed by ${event.sourceName} via Abridgd`]
    .filter(Boolean)
    .join("\n\n");

/** `YYYY-MM-DD` to UTC midnight of that date. */
const utcMidnight = (date: string): number => {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

/**
 * Start and end as the calendar should see them. Open-ended events get a one-hour block.
 *
 * All-day events are the platform-specific case. Android's calendar stores all-day events as UTC
 * midnight to UTC midnight; iOS treats an all-day event's dates in the device's own time zone.
 * So Android gets UTC midnights, and iOS keeps the Eastern-midnight instant. The end is the
 * exclusive day after the last day. (Not yet confirmed on a device.)
 */
export const eventTimeRange = (event: AppEvent): { start: Date; end: Date } => {
  if (event.allDay) {
    const lastLocalDate = event.endsAt ? getEasternParts(event.endsAt).date : event.localDate;
    const endDate = addDaysToDate(lastLocalDate >= event.localDate ? lastLocalDate : event.localDate, 1);
    if (Platform.OS === "android") {
      return { start: new Date(utcMidnight(event.localDate)), end: new Date(utcMidnight(endDate)) };
    }
    const [ey, em, ed] = endDate.split("-").map(Number);
    return { start: new Date(event.startsAt), end: new Date(easternWallTimeToUtcMs(ey, em, ed, 0, 0)) };
  }

  const end =
    event.endsAt && event.endsAt > event.startsAt
      ? new Date(event.endsAt)
      : new Date(event.startsAt + DEFAULT_DURATION_MS);
  return { start: new Date(event.startsAt), end };
};

/** The event as `expo-calendar` expects it, for the system add-event screen. */
export const buildCalendarEventData = (event: AppEvent) => {
  const { start, end } = eventTimeRange(event);
  return {
    title: event.title,
    startDate: start,
    endDate: end,
    allDay: event.allDay,
    timeZone: EVENT_TIME_ZONE,
    location: location(event),
    notes: notes(event),
    url: event.url,
  };
};

const compactUtc = (date: Date): string =>
  date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

/**
 * A Google Calendar "create event" link. This is the fallback when the device has no native
 * calendar UI, and the web build's only route. It needs no permission and no account in the app.
 */
export const buildGoogleCalendarUrl = (event: AppEvent): string => {
  const { start, end } = eventTimeRange(event);
  const dates = event.allDay
    ? `${event.localDate.replace(/-/g, "")}/${addDaysToDate(event.localDate, 1).replace(/-/g, "")}`
    : `${compactUtc(start)}/${compactUtc(end)}`;

  const params: Array<[string, string]> = [
    ["action", "TEMPLATE"],
    ["text", event.title],
    ["dates", dates],
    ["details", notes(event)],
  ];
  const place = location(event);
  if (place) params.push(["location", place]);
  params.push(["ctz", EVENT_TIME_ZONE]);

  return `https://calendar.google.com/calendar/render?${params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")}`;
};

/**
 * Hands an event to the device's own calendar.
 *
 * This uses the OS's add-event screen (Android's calendar insert intent, iOS's event editor), so
 * the app never reads the calendar and never requests calendar permission: the person reviews the
 * event, chooses which calendar it goes in and taps Save. The `expo-calendar` config plugin is
 * deliberately not used, since it would add read and write permissions this flow does not need.
 * If the native screen is unavailable or fails, a calendar link opens in the browser instead.
 */
export const addEventToCalendar = async (event: AppEvent): Promise<AddToCalendarResult> => {
  try {
    if (await Calendar.isAvailableAsync()) {
      const result = await Calendar.createEventInCalendarAsync(buildCalendarEventData(event));
      if (result.action === "saved") return "saved";
      if (result.action === "canceled") return "canceled";
      return "shown";
    }
  } catch (error) {
    // Falls through to the link below; keep the reason out of logs that could carry titles.
    console.warn("Native add-to-calendar unavailable, using a calendar link", error instanceof Error ? error.name : "error");
  }

  return (await openExternalUrl(buildGoogleCalendarUrl(event))) ? "link" : "failed";
};
