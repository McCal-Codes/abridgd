import { htmlToPlainText, parseLegistarResponse, parseTribeEvent, parseTribeResponse } from "../parsers";
import { EVENT_SOURCES } from "../eventSources";
import { EventSource } from "../types";

const source = (id: string): EventSource => {
  const found = EVENT_SOURCES.find((s) => s.id === id);
  if (!found) throw new Error(`no source ${id}`);
  return found;
};

describe("htmlToPlainText", () => {
  it("strips tags, decodes entities and collapses whitespace", () => {
    expect(htmlToPlainText("<p>Join us &amp; bring a friend&#8217;s book.</p><p>Free</p>")).toBe(
      "Join us & bring a friend’s book. Free",
    );
  });
  it("returns an empty string for non-strings", () => {
    expect(htmlToPlainText(undefined)).toBe("");
    expect(htmlToPlainText(42)).toBe("");
  });
});

describe("parseTribeEvent (The Events Calendar JSON)", () => {
  const kidsburgh = source("kidsburgh");

  const base = {
    id: 10003479,
    title: "Wild Goose Chase Scavenger Hunt",
    url: "https://www.kidsburgh.org/ec/wild-goose-chase/2026-11-05/",
    start_date: "2026-11-05 10:00:00",
    end_date: "2026-11-05 12:00:00",
    all_day: false,
    cost: "Free",
    description: "<p>Explore the grounds &amp; solve the clues.</p>",
    venue: { venue: "The Frick Pittsburgh", address: "7227 Reynolds St", city: "Pittsburgh", state: "PA", zip: "15208" },
    categories: [{ name: "Family &amp; Kids" }],
  };

  it("normalises a typical event", () => {
    const event = parseTribeEvent(base, kidsburgh)!;
    expect(event).toMatchObject({
      id: "kidsburgh:10003479",
      title: "Wild Goose Chase Scavenger Hunt",
      localDate: "2026-11-05",
      localTime: "10:00",
      endLocalTime: "12:00",
      venue: "The Frick Pittsburgh",
      address: "7227 Reynolds St, Pittsburgh, PA",
      area: "East End",
      category: "Family & Kids",
      cost: "Free",
      sourceName: "Kidsburgh",
      allDay: false,
    });
    expect(event.summary).toBe("Explore the grounds & solve the clues.");
    // 10:00 AM EST on Nov 5 is 15:00 UTC.
    expect(event.startsAt).toBe(Date.UTC(2026, 10, 5, 15, 0));
    expect(event.endsAt).toBe(Date.UTC(2026, 10, 5, 17, 0));
  });

  it("decodes entities in titles", () => {
    const event = parseTribeEvent({ ...base, title: "Trail Tour &#8211; Lichens &amp; Moss" }, kidsburgh)!;
    expect(event.title).toBe("Trail Tour – Lichens & Moss");
  });

  it("handles the plugin's empty-array venue and applies the source default", () => {
    const heinz = source("heinz-history");
    const event = parseTribeEvent({ ...base, venue: [] }, heinz)!;
    expect(event.venue).toBe("Heinz History Center");
    expect(event.area).toBe("Downtown & Strip");
    expect(event.address).toBeUndefined();
  });

  it("marks suburban venues as outside the city", () => {
    const event = parseTribeEvent(
      { ...base, venue: { venue: "Beanstalk HQ", city: "Wexford", state: "PA", zip: "15090", address: "1 Main St" } },
      kidsburgh,
    )!;
    expect(event.area).toBe("Outside the city");
  });

  it("treats an all-day event as starting at the day's start with no clock time", () => {
    const event = parseTribeEvent({ ...base, all_day: true, start_date: "2026-11-05 00:00:00", end_date: "2026-11-06 23:59:59" }, kidsburgh)!;
    expect(event.allDay).toBe(true);
    expect(event.localTime).toBeUndefined();
    expect(event.endsAt).toBeGreaterThan(event.startsAt);
  });

  it("drops an end time that precedes the start", () => {
    const event = parseTribeEvent({ ...base, end_date: "2026-11-05 08:00:00" }, kidsburgh)!;
    expect(event.endsAt).toBeUndefined();
  });

  it("rejects events missing a title, start, id or http(s) url", () => {
    expect(parseTribeEvent({ ...base, title: "" }, kidsburgh)).toBeNull();
    expect(parseTribeEvent({ ...base, start_date: "soon" }, kidsburgh)).toBeNull();
    expect(parseTribeEvent({ ...base, id: undefined }, kidsburgh)).toBeNull();
    expect(parseTribeEvent({ ...base, url: "javascript:alert(1)" }, kidsburgh)).toBeNull();
    expect(parseTribeEvent({ ...base, url: "tel:5551234" }, kidsburgh)).toBeNull();
  });

  it("clips a long description to a short summary", () => {
    const event = parseTribeEvent({ ...base, description: `<p>${"word ".repeat(200)}</p>` }, kidsburgh)!;
    expect(event.summary!.length).toBeLessThanOrEqual(281);
    expect(event.summary!.endsWith("…")).toBe(true);
  });

  it("parseTribeResponse skips bad rows and tolerates a non-object body", () => {
    expect(parseTribeResponse({ events: [base, { id: 1 }] }, kidsburgh)).toHaveLength(1);
    expect(parseTribeResponse(null, kidsburgh)).toEqual([]);
    expect(parseTribeResponse({ events: "nope" }, kidsburgh)).toEqual([]);
  });
});

describe("parseLegistarResponse (City of Pittsburgh meetings)", () => {
  const city = source("city-meetings");
  const row = (over: Record<string, unknown>) => ({
    EventId: 12136,
    EventBodyName: "City Council",
    EventDate: "2026-11-09T00:00:00",
    EventTime: "10:01 AM",
    EventLocation: "Council Chambers",
    EventInSiteURL: "https://pittsburgh.legistar.com/MeetingDetail.aspx?LEGID=12136",
    EventComment: null,
    ...over,
  });

  it("combines the date and the separate time string into an Eastern instant", () => {
    const [event] = parseLegistarResponse([row({})], city);
    expect(event).toMatchObject({
      id: "city-meetings:12136",
      title: "City Council",
      localDate: "2026-11-09",
      localTime: "10:01",
      area: "Downtown & Strip",
      category: "Civic",
      venue: "City-County Building, Council Chambers",
    });
    // 10:01 AM EST = 15:01 UTC
    expect(event.startsAt).toBe(Date.UTC(2026, 10, 9, 15, 1));
  });

  it("keeps one row when a council meeting is listed twice a minute apart", () => {
    const events = parseLegistarResponse(
      [row({ EventId: 1, EventTime: "10:00 AM" }), row({ EventId: 2, EventTime: "10:01 AM" })],
      city,
    );
    expect(events).toHaveLength(1);
  });

  it("names non-meeting bodies as meetings, carries the agenda note, and drops unparseable rows", () => {
    const events = parseLegistarResponse(
      [
        row({ EventId: 5, EventBodyName: "Post Agenda", EventTime: "1:30 PM", EventComment: "Homelessness in the Winter" }),
        row({ EventId: 6, EventTime: "TBD" }),
        row({ EventId: 7, EventInSiteURL: "ftp://x" }),
      ],
      city,
    );
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Post Agenda meeting");
    expect(events[0].summary).toBe("Homelessness in the Winter");
  });

  it("returns [] for anything that is not a list", () => {
    expect(parseLegistarResponse({ oops: true }, city)).toEqual([]);
  });
});
