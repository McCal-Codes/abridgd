import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import { addEventToCalendar, buildCalendarEventData, buildGoogleCalendarUrl, eventTimeRange } from "../calendar";
import { easternWallTimeToUtcMs } from "../time";
import { AppEvent } from "../types";

jest.mock("expo-calendar", () => ({
  isAvailableAsync: jest.fn(),
  createEventInCalendarAsync: jest.fn(),
}));

const mockOpenExternalUrl = jest.fn();
jest.mock("../../../utils/openExternalUrl", () => ({
  openExternalUrl: (...args: unknown[]) => mockOpenExternalUrl(...args),
}));

const event = (over: Partial<AppEvent> = {}): AppEvent => ({
  id: "kidsburgh:1",
  title: "Family story hour",
  startsAt: easternWallTimeToUtcMs(2026, 11, 7, 10, 30),
  endsAt: easternWallTimeToUtcMs(2026, 11, 7, 11, 30),
  allDay: false,
  localDate: "2026-11-07",
  localTime: "10:30",
  venue: "Schenley Park",
  address: "Overlook Dr, Pittsburgh, PA",
  area: "East End",
  summary: "Stories & songs.",
  url: "https://www.kidsburgh.org/ec/story-hour/",
  sourceId: "kidsburgh",
  sourceName: "Kidsburgh",
  ...over,
});

describe("calendar hand-off", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  describe("eventTimeRange", () => {
    it("uses the listed end", () => {
      const { start, end } = eventTimeRange(event());
      expect(end.getTime() - start.getTime()).toBe(3600_000);
    });
    it("gives an open-ended event a one-hour block", () => {
      const { start, end } = eventTimeRange(event({ endsAt: undefined }));
      expect(end.getTime() - start.getTime()).toBe(3600_000);
    });
    it("gives an all-day event with no end a single day", () => {
      const { start, end } = eventTimeRange(
        event({ allDay: true, endsAt: undefined, startsAt: easternWallTimeToUtcMs(2026, 11, 7, 0, 0) }),
      );
      expect(end.getTime() - start.getTime()).toBe(24 * 3600_000);
    });
    it("ends a multi-day all-day event the day after its last day", () => {
      const { start, end } = eventTimeRange(
        event({
          allDay: true,
          startsAt: easternWallTimeToUtcMs(2026, 11, 7, 0, 0),
          endsAt: easternWallTimeToUtcMs(2026, 11, 9, 23, 59),
        }),
      );
      expect(end.getTime() - start.getTime()).toBe(3 * 24 * 3600_000);
    });
    it("uses UTC midnights for all-day events on Android", () => {
      const original = Platform.OS;
      Platform.OS = "android";
      try {
        const { start, end } = eventTimeRange(event({ allDay: true, endsAt: undefined }));
        expect(start.toISOString()).toBe("2026-11-07T00:00:00.000Z");
        expect(end.toISOString()).toBe("2026-11-08T00:00:00.000Z");
      } finally {
        Platform.OS = original;
      }
    });
  });

  it("builds the event data for the system screen, with the source link in the notes", () => {
    const data = buildCalendarEventData(event());
    expect(data.title).toBe("Family story hour");
    expect(data.location).toBe("Schenley Park, Overlook Dr, Pittsburgh, PA");
    expect(data.timeZone).toBe("America/New_York");
    expect(data.notes).toContain("https://www.kidsburgh.org/ec/story-hour/");
    expect(data.notes).toContain("Listed by Kidsburgh via Abridgd");
  });

  it("does not repeat a venue that is already part of the address", () => {
    const data = buildCalendarEventData(event({ venue: "Schenley Park", address: "Schenley Park, Pittsburgh, PA" }));
    expect(data.location).toBe("Schenley Park, Pittsburgh, PA");
  });

  describe("buildGoogleCalendarUrl", () => {
    it("encodes a timed event in UTC", () => {
      const url = buildGoogleCalendarUrl(event());
      expect(url.startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE")).toBe(true);
      // 10:30 AM EST = 15:30Z, 11:30 AM = 16:30Z
      expect(url).toContain("dates=20261107T153000Z%2F20261107T163000Z");
      expect(url).toContain(`text=${encodeURIComponent("Family story hour")}`);
      expect(url).toContain("ctz=America%2FNew_York");
    });
    it("uses plain dates with an exclusive end for an all-day event", () => {
      const url = buildGoogleCalendarUrl(event({ allDay: true, endsAt: undefined }));
      expect(url).toContain("dates=20261107%2F20261108");
    });
    it("omits location when there is none", () => {
      expect(buildGoogleCalendarUrl(event({ venue: undefined, address: undefined }))).not.toContain("location=");
    });
  });

  describe("addEventToCalendar", () => {
    it("shows the native add-event screen and reports a save", async () => {
      (Calendar.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Calendar.createEventInCalendarAsync as jest.Mock).mockResolvedValue({ action: "saved" });

      await expect(addEventToCalendar(event())).resolves.toBe("saved");
      expect(Calendar.createEventInCalendarAsync).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Family story hour" }),
      );
      expect(mockOpenExternalUrl).not.toHaveBeenCalled();
    });

    it("reports a cancel on iOS and a neutral result on Android", async () => {
      (Calendar.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Calendar.createEventInCalendarAsync as jest.Mock).mockResolvedValueOnce({ action: "canceled" });
      await expect(addEventToCalendar(event())).resolves.toBe("canceled");
      (Calendar.createEventInCalendarAsync as jest.Mock).mockResolvedValueOnce({ action: "done" });
      await expect(addEventToCalendar(event())).resolves.toBe("shown");
    });

    it("falls back to a calendar link when the native screen throws", async () => {
      (Calendar.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Calendar.createEventInCalendarAsync as jest.Mock).mockRejectedValue(new Error("no calendar app"));
      mockOpenExternalUrl.mockResolvedValue(true);

      await expect(addEventToCalendar(event())).resolves.toBe("link");
      expect(mockOpenExternalUrl).toHaveBeenCalledWith(expect.stringContaining("calendar.google.com"));
    });

    it("falls back to a link when the calendar is unavailable (web), and reports failure if that fails too", async () => {
      (Calendar.isAvailableAsync as jest.Mock).mockResolvedValue(false);
      mockOpenExternalUrl.mockResolvedValueOnce(true);
      await expect(addEventToCalendar(event())).resolves.toBe("link");
      mockOpenExternalUrl.mockResolvedValueOnce(false);
      await expect(addEventToCalendar(event())).resolves.toBe("failed");
    });
  });
});
