import { dateBlockParts, describeEvent, formatEventPlace, formatEventTime, formatEventWhen } from "../format";
import { AppEvent } from "../types";

const event: AppEvent = {
  id: "k:1",
  title: "Family story hour",
  startsAt: 0,
  allDay: false,
  localDate: "2026-11-07",
  localTime: "10:30",
  endLocalTime: "11:30",
  venue: "Schenley Park",
  area: "East End",
  url: "https://example.org",
  sourceId: "k",
  sourceName: "Kidsburgh",
};

describe("event formatting", () => {
  it("formats times", () => {
    expect(formatEventTime(event)).toBe("10:30 AM");
    expect(formatEventTime(event, true)).toBe("10:30 AM to 11:30 AM");
    expect(formatEventTime({ ...event, allDay: true, localTime: undefined })).toBe("All day");
  });
  it("prefers the venue, then the area, and says Online when online", () => {
    expect(formatEventPlace(event)).toBe("Schenley Park");
    expect(formatEventPlace({ ...event, venue: undefined })).toBe("East End");
    expect(formatEventPlace({ ...event, area: "Online" })).toBe("Online");
  });
  it("builds the detail line and the date block", () => {
    expect(formatEventWhen(event)).toBe("Saturday, Nov 7 · 10:30 AM to 11:30 AM");
    expect(dateBlockParts(event)).toEqual({ weekday: "SAT", day: "7" });
  });
  it("reads a card as one sentence", () => {
    expect(describeEvent(event, true)).toBe(
      "Family story hour, Saturday, Nov 7, 10:30 AM to 11:30 AM, Schenley Park, Listed by Kidsburgh, Saved",
    );
  });
});
