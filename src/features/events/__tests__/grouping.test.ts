import {
  applyFilter,
  buildFilterChips,
  filtersEqual,
  groupByDay,
  groupSavedEvents,
  isEventEnded,
  pickHomeEvents,
  selectUpcoming,
} from "../grouping";
import { easternWallTimeToUtcMs } from "../time";
import { AppEvent } from "../types";

// Thursday, Nov 5 2026, 9:00 AM Eastern.
const NOW = easternWallTimeToUtcMs(2026, 11, 5, 9, 0);

const ev = (over: Partial<AppEvent> & { id: string; localDate: string }): AppEvent => {
  const [y, m, d] = over.localDate.split("-").map(Number);
  const startsAt = over.startsAt ?? easternWallTimeToUtcMs(y, m, d, 18, 0);
  return {
    title: over.id,
    startsAt,
    allDay: false,
    localTime: "18:00",
    area: "East End",
    url: "https://example.com/e",
    sourceId: "a",
    sourceName: "A",
    ...over,
  };
};

describe("selectUpcoming", () => {
  it("drops ended events, keeps ongoing ones under today, and caps the window at 14 days", () => {
    const events = [
      ev({ id: "ended", localDate: "2026-11-05", startsAt: easternWallTimeToUtcMs(2026, 11, 5, 7, 0), endsAt: easternWallTimeToUtcMs(2026, 11, 5, 8, 0) }),
      ev({ id: "ongoing", localDate: "2026-11-01", allDay: true, endsAt: easternWallTimeToUtcMs(2026, 11, 30, 23, 0) }),
      ev({ id: "tonight", localDate: "2026-11-05" }),
      ev({ id: "last-day", localDate: "2026-11-18" }),
      ev({ id: "too-far", localDate: "2026-11-19" }),
    ];
    const ids = selectUpcoming(events, NOW).map((e) => e.id);
    expect(ids).toEqual(["ongoing", "tonight", "last-day"]);
  });

  it("removes duplicate ids", () => {
    const e = ev({ id: "dup", localDate: "2026-11-06" });
    expect(selectUpcoming([e, e], NOW)).toHaveLength(1);
  });

  it("orders by day, then time", () => {
    const events = [
      ev({ id: "late", localDate: "2026-11-06", startsAt: easternWallTimeToUtcMs(2026, 11, 6, 20, 0) }),
      ev({ id: "early", localDate: "2026-11-06", startsAt: easternWallTimeToUtcMs(2026, 11, 6, 9, 0) }),
      ev({ id: "sooner", localDate: "2026-11-05" }),
    ];
    expect(selectUpcoming(events, NOW).map((e) => e.id)).toEqual(["sooner", "early", "late"]);
  });
});

describe("groupByDay", () => {
  it("labels today and tomorrow and groups ongoing events under today", () => {
    const events = selectUpcoming(
      [
        ev({ id: "ongoing", localDate: "2026-11-01", allDay: true, endsAt: easternWallTimeToUtcMs(2026, 11, 30, 23, 0) }),
        ev({ id: "a", localDate: "2026-11-06" }),
        ev({ id: "b", localDate: "2026-11-07" }),
      ],
      NOW,
    );
    const groups = groupByDay(events, NOW);
    expect(groups.map((g) => g.label)).toEqual(["Today · Thu, Nov 5", "Tomorrow · Fri, Nov 6", "Sat, Nov 7"]);
    expect(groups[0].events.map((e) => e.id)).toEqual(["ongoing"]);
  });
});

describe("filters and chips", () => {
  const events = [
    ev({ id: "tonight", localDate: "2026-11-05", area: "Downtown & Strip" }),
    ev({ id: "sat", localDate: "2026-11-07", area: "East End" }),
    ev({ id: "sun", localDate: "2026-11-08", area: "Outside the city" }),
    ev({ id: "tue", localDate: "2026-11-10", area: "East End" }),
  ];

  it("filters by today, weekend and area", () => {
    expect(applyFilter(events, { kind: "today" }, NOW).map((e) => e.id)).toEqual(["tonight"]);
    expect(applyFilter(events, { kind: "weekend" }, NOW).map((e) => e.id)).toEqual(["sat", "sun"]);
    expect(applyFilter(events, { kind: "area", area: "East End" }, NOW).map((e) => e.id)).toEqual(["sat", "tue"]);
    expect(applyFilter(events, { kind: "all" }, NOW)).toHaveLength(4);
  });

  it("builds chips only from what is listed, in geographic order", () => {
    const labels = buildFilterChips(events, NOW).map((c) => c.label);
    expect(labels).toEqual(["All", "Today", "This weekend", "Downtown & Strip", "East End", "Outside the city"]);
  });

  it("omits Today, weekend and area chips when they would add nothing", () => {
    const only = [ev({ id: "tue", localDate: "2026-11-10", area: "East End" })];
    expect(buildFilterChips(only, NOW).map((c) => c.label)).toEqual(["All"]);
  });

  it("compares filters", () => {
    expect(filtersEqual({ kind: "all" }, { kind: "all" })).toBe(true);
    expect(filtersEqual({ kind: "area", area: "A" }, { kind: "area", area: "A" })).toBe(true);
    expect(filtersEqual({ kind: "area", area: "A" }, { kind: "area", area: "B" })).toBe(false);
    expect(filtersEqual({ kind: "today" }, { kind: "weekend" })).toBe(false);
  });
});

describe("pickHomeEvents", () => {
  it("favours variety across organizers while keeping time order", () => {
    const events = [
      ev({ id: "a1", localDate: "2026-11-05", sourceId: "a" }),
      ev({ id: "a2", localDate: "2026-11-05", sourceId: "a" }),
      ev({ id: "b1", localDate: "2026-11-06", sourceId: "b" }),
      ev({ id: "c1", localDate: "2026-11-07", sourceId: "c" }),
    ];
    expect(pickHomeEvents(events, 3).map((e) => e.id)).toEqual(["a1", "b1", "c1"]);
  });

  it("falls back to more from one organizer when that is all there is", () => {
    const events = [
      ev({ id: "a1", localDate: "2026-11-05", sourceId: "a" }),
      ev({ id: "a2", localDate: "2026-11-06", sourceId: "a" }),
    ];
    expect(pickHomeEvents(events, 3).map((e) => e.id)).toEqual(["a1", "a2"]);
  });
});

describe("groupSavedEvents", () => {
  const ended = ev({
    id: "ended",
    localDate: "2026-11-01",
    startsAt: easternWallTimeToUtcMs(2026, 11, 1, 9, 0),
    endsAt: easternWallTimeToUtcMs(2026, 11, 1, 11, 0),
  });
  const olderEnded = ev({
    id: "older",
    localDate: "2026-10-20",
    startsAt: easternWallTimeToUtcMs(2026, 10, 20, 9, 0),
    endsAt: easternWallTimeToUtcMs(2026, 10, 20, 11, 0),
  });

  it("splits what is still ahead from what has ended, most recently ended first", () => {
    const groups = groupSavedEvents(
      [olderEnded, ev({ id: "sat", localDate: "2026-11-07" }), ended, ev({ id: "tue", localDate: "2026-11-10" })],
      NOW,
    );
    expect(groups.upcoming.map((g) => g.events.map((e) => e.id))).toEqual([["sat"], ["tue"]]);
    expect(groups.ended.map((e) => e.id)).toEqual(["ended", "older"]);
  });

  it("does not cap saved events at the 14-day window", () => {
    const far = ev({ id: "far", localDate: "2027-01-20" });
    expect(groupSavedEvents([far], NOW).upcoming[0].events).toEqual([far]);
  });

  it("keeps an event that is still on under today and removes duplicate ids", () => {
    const ongoing = ev({
      id: "ongoing",
      localDate: "2026-11-01",
      allDay: true,
      endsAt: easternWallTimeToUtcMs(2026, 11, 30, 23, 0),
    });
    const groups = groupSavedEvents([ongoing, ongoing], NOW);
    expect(groups.upcoming).toHaveLength(1);
    expect(groups.upcoming[0].label).toMatch(/^Today ·/);
    expect(groups.upcoming[0].events).toHaveLength(1);
  });

  it("returns nothing for nothing", () => {
    expect(groupSavedEvents([], NOW)).toEqual({ upcoming: [], ended: [] });
  });

  it("treats an event with no end as over two hours after it starts", () => {
    const noEnd = ev({ id: "noend", localDate: "2026-11-05", startsAt: easternWallTimeToUtcMs(2026, 11, 5, 6, 0) });
    expect(isEventEnded(noEnd, NOW)).toBe(true);
    expect(isEventEnded(ev({ id: "later", localDate: "2026-11-05" }), NOW)).toBe(false);
  });
});
