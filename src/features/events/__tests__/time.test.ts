import {
  addDaysToDate,
  easternOffsetByRule,
  easternWallTimeToUtcMs,
  formatClock,
  formatLongDay,
  formatShortDay,
  getEasternParts,
  parseClock12,
} from "../time";

describe("Eastern time helpers", () => {
  it("applies the US daylight-saving rule", () => {
    // 2026: DST runs Mar 8 to Nov 1.
    expect(easternOffsetByRule(Date.UTC(2026, 6, 4, 12))).toBe(-4 * 3600_000);
    expect(easternOffsetByRule(Date.UTC(2026, 10, 5, 12))).toBe(-5 * 3600_000);
    expect(easternOffsetByRule(Date.UTC(2026, 2, 8, 6, 59))).toBe(-5 * 3600_000);
    expect(easternOffsetByRule(Date.UTC(2026, 2, 8, 7, 0))).toBe(-4 * 3600_000);
    expect(easternOffsetByRule(Date.UTC(2026, 10, 1, 5, 59))).toBe(-4 * 3600_000);
    expect(easternOffsetByRule(Date.UTC(2026, 10, 1, 6, 0))).toBe(-5 * 3600_000);
  });

  it("converts an Eastern wall time to the right UTC instant on both sides of DST", () => {
    // Nov 5 2026 is standard time: 7:00 PM EST = 00:00 UTC next day.
    expect(easternWallTimeToUtcMs(2026, 11, 5, 19, 0)).toBe(Date.UTC(2026, 10, 6, 0, 0));
    // July 4 2026 is daylight time: 7:00 PM EDT = 23:00 UTC.
    expect(easternWallTimeToUtcMs(2026, 7, 4, 19, 0)).toBe(Date.UTC(2026, 6, 4, 23, 0));
  });

  it("reads the Eastern calendar date for an instant, even across midnight UTC", () => {
    // 2026-11-06 02:30 UTC is still Nov 5, 9:30 PM in Pittsburgh.
    const parts = getEasternParts(Date.UTC(2026, 10, 6, 2, 30));
    expect(parts.date).toBe("2026-11-05");
    expect(parts.hour).toBe(21);
    expect(parts.weekday).toBe(4); // Thursday
  });

  it("does calendar arithmetic on dates", () => {
    expect(addDaysToDate("2026-11-05", 14)).toBe("2026-11-19");
    expect(addDaysToDate("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDaysToDate("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("formats days and clock times", () => {
    expect(formatShortDay("2026-11-07")).toBe("Sat, Nov 7");
    expect(formatLongDay("2026-11-07")).toBe("Saturday, Nov 7");
    expect(formatClock("00:05")).toBe("12:05 AM");
    expect(formatClock("12:00")).toBe("12:00 PM");
    expect(formatClock("19:30")).toBe("7:30 PM");
  });

  it("parses 12-hour clock strings", () => {
    expect(parseClock12("1:00 PM")).toBe("13:00");
    expect(parseClock12("10:01 AM")).toBe("10:01");
    expect(parseClock12("12:15 AM")).toBe("00:15");
    expect(parseClock12("noon")).toBeNull();
    expect(parseClock12(null)).toBeNull();
  });
});
