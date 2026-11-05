import AsyncStorage from "@react-native-async-storage/async-storage";
import { __resetEventsCacheForTests } from "../eventsCache";
import {
  buildLegistarUrl,
  buildTribeUrl,
  EVENTS_SOFT_TTL_MS,
  EventsLoadError,
  getCachedEvents,
  loadEvents,
} from "../eventsRepository";
import { EVENT_SOURCES } from "../eventSources";
import { easternWallTimeToUtcMs } from "../time";

const mockFetch = jest.fn();
jest.mock("../../../services/feed/transport", () => ({
  fetchWithTimeout: (...args: unknown[]) => mockFetch(...args),
}));

const NOW = easternWallTimeToUtcMs(2026, 11, 5, 9, 0);

const tribeEvent = (id: number, title: string) => ({
  id,
  title,
  url: `https://example.org/e/${id}`,
  start_date: "2026-11-07 10:00:00",
  end_date: "2026-11-07 11:00:00",
  all_day: false,
  venue: { venue: "Hall", city: "Pittsburgh", zip: "15213", address: "1 Main" },
});

const ok = (body: unknown) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
const fail = (status = 500) => Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) });

/** Route by host so each source can succeed or fail independently. */
const route = (handlers: Record<string, (url: string) => Promise<unknown>>) => {
  mockFetch.mockImplementation((url: string) => {
    const host = Object.keys(handlers).find((h) => url.includes(h));
    return host ? handlers[host](url) : fail(404);
  });
};

describe("events repository", () => {
  beforeEach(async () => {
    mockFetch.mockReset();
    await AsyncStorage.clear();
    __resetEventsCacheForTests();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("builds source URLs from the window", () => {
    const kids = EVENT_SOURCES.find((s) => s.id === "kidsburgh")!;
    const city = EVENT_SOURCES.find((s) => s.id === "city-meetings")!;
    expect(buildTribeUrl(kids, "2026-11-04", "2026-11-20")).toBe(
      "https://www.kidsburgh.org/wp-json/tribe/events/v1/events?per_page=50&start_date=2026-11-04&end_date=2026-11-20",
    );
    const legistar = buildLegistarUrl(city, "2026-11-04", "2026-11-20");
    expect(legistar.startsWith("https://webapi.legistar.com/v1/pittsburgh/Events?$filter=")).toBe(true);
    expect(decodeURIComponent(legistar)).toContain("EventDate ge datetime'2026-11-04'");
  });

  it("fetches every enabled source on a cold start and merges the results", async () => {
    route({
      "kidsburgh.org": () => ok({ events: [tribeEvent(1, "Story hour")] }),
      "wqed.org": () => ok({ events: [tribeEvent(2, "Jazz night")] }),
      "bloomfieldpgh.org": () => ok({ events: [] }),
      "pittsburghparks.org": () => ok({ events: [] }),
      "heinzhistorycenter.org": () => ok({ events: [] }),
      "carnegiemuseums.org": () => ok({ events: [] }),
      "legistar.com": () => ok([]),
    });

    const result = await loadEvents({ now: NOW });

    expect(result.events.map((e) => e.title).sort()).toEqual(["Jazz night", "Story hour"]);
    expect(result.failedSources).toEqual([]);
    expect(result.stale).toBe(false);
    expect(result.lastUpdated).toBe(NOW);
  });

  it("serves fresh cache without any request, and refetches once it is past the TTL", async () => {
    route({
      "kidsburgh.org": () => ok({ events: [tribeEvent(1, "Story hour")] }),
      "legistar.com": () => ok([]),
    });
    mockFetch.mockImplementation((url: string) => ok(url.includes("kidsburgh") ? { events: [tribeEvent(1, "Story hour")] } : url.includes("legistar") ? [] : { events: [] }));

    await loadEvents({ now: NOW });
    const callsAfterFirst = mockFetch.mock.calls.length;

    await loadEvents({ now: NOW + 60_000 });
    expect(mockFetch.mock.calls.length).toBe(callsAfterFirst);

    await loadEvents({ now: NOW + EVENTS_SOFT_TTL_MS + 1000 });
    expect(mockFetch.mock.calls.length).toBeGreaterThan(callsAfterFirst);
  });

  it("keeps a source's last good events when its refresh fails, and reports the failure", async () => {
    mockFetch.mockImplementation((url: string) =>
      ok(url.includes("kidsburgh") ? { events: [tribeEvent(1, "Story hour")] } : url.includes("legistar") ? [] : { events: [] }),
    );
    await loadEvents({ now: NOW });

    mockFetch.mockImplementation((url: string) => (url.includes("kidsburgh") ? fail(503) : ok(url.includes("legistar") ? [] : { events: [] })));
    const result = await loadEvents({ now: NOW + 1000, force: true });

    expect(result.events.map((e) => e.title)).toEqual(["Story hour"]);
    expect(result.failedSources).toEqual(["Kidsburgh"]);
  });

  it("throws EventsLoadError only when nothing has ever loaded", async () => {
    mockFetch.mockImplementation(() => fail(500));
    await expect(loadEvents({ now: NOW })).rejects.toBeInstanceOf(EventsLoadError);
  });

  it("returns an empty list, not an error, when sources load but have no events", async () => {
    mockFetch.mockImplementation((url: string) => ok(url.includes("legistar") ? [] : { events: [] }));
    const result = await loadEvents({ now: NOW });
    expect(result.events).toEqual([]);
  });

  it("follows a next page only on the organizer's own site", async () => {
    const calls: string[] = [];
    mockFetch.mockImplementation((url: string) => {
      calls.push(url);
      if (url.includes("kidsburgh") && !url.includes("page=2")) {
        return ok({ events: [tribeEvent(1, "One")], next_rest_url: "https://www.kidsburgh.org/wp-json/tribe/events/v1/events?page=2" });
      }
      if (url.includes("kidsburgh")) return ok({ events: [tribeEvent(2, "Two")] });
      if (url.includes("wqed")) {
        return ok({ events: [tribeEvent(3, "Three")], next_rest_url: "https://evil.example/wp-json/steal" });
      }
      return ok(url.includes("legistar") ? [] : { events: [] });
    });

    const result = await loadEvents({ now: NOW });

    expect(result.events.map((e) => e.title).sort()).toEqual(["One", "Three", "Two"]);
    expect(calls.some((u) => u.includes("evil.example"))).toBe(false);
  });

  it("asks every source for JSON, because Legistar answers XML to the feed transport's default Accept", async () => {
    mockFetch.mockImplementation((url: string) => ok(url.includes("legistar") ? [] : { events: [] }));
    await loadEvents({ now: NOW });
    expect(mockFetch).toHaveBeenCalled();
    for (const call of mockFetch.mock.calls) {
      expect(call[1]).toEqual({ Accept: "application/json" });
    }
  });

  it("reads cached events without the network", async () => {
    mockFetch.mockImplementation((url: string) => ok(url.includes("kidsburgh") ? { events: [tribeEvent(1, "Story hour")] } : url.includes("legistar") ? [] : { events: [] }));
    await loadEvents({ now: NOW });
    mockFetch.mockClear();
    expect(getCachedEvents(NOW).events.map((e) => e.title)).toEqual(["Story hour"]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
