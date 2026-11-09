import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react-native";
import { EventsSection } from "../ui/EventsSection";
import { EventsScreen } from "../ui/EventsScreen";
import { EventDetailSheet } from "../ui/EventDetailSheet";
import { useEvents } from "../useEvents";
import { addEventToCalendar } from "../calendar";
import { easternWallTimeToUtcMs, getEasternParts, addDaysToDate } from "../time";
import { AppEvent } from "../types";

jest.mock("../calendar", () => ({ addEventToCalendar: jest.fn() }));
jest.mock("../../../utils/openExternalUrl", () => ({ openExternalUrl: jest.fn() }));
jest.mock("../../../hooks/useReduceMotion", () => ({ useReduceMotion: () => true }));

let mockImageMode = "full";
jest.mock("../../../context/SettingsContext", () => ({
  useSettings: () => ({ imageLoadingMode: mockImageMode }),
}));

const mockUseEvents = useEvents as jest.Mock;

const today = getEasternParts(Date.now()).date;
const at = (offsetDays: number, hour: number) => {
  const date = addDaysToDate(today, offsetDays);
  const [y, m, d] = date.split("-").map(Number);
  return { date, ms: easternWallTimeToUtcMs(y, m, d, hour, 0) };
};

const make = (id: string, title: string, offsetDays: number, over: Partial<AppEvent> = {}): AppEvent => {
  const { date, ms } = at(offsetDays, 19);
  return {
    id,
    title,
    startsAt: ms,
    endsAt: ms + 2 * 3600_000,
    allDay: false,
    localDate: date,
    localTime: "19:00",
    endLocalTime: "21:00",
    venue: "Hall",
    area: "East End",
    url: `https://example.org/${id}`,
    sourceId: id.split(":")[0],
    sourceName: id.split(":")[0],
    ...over,
  };
};

const state = (events: AppEvent[], over: Record<string, unknown> = {}) => ({
  events,
  loading: false,
  refreshing: false,
  error: null,
  stale: false,
  failedSources: [],
  lastUpdated: new Date(),
  refresh: jest.fn(async () => ({ count: events.length, failed: false })),
  ...over,
});

describe("EventsSection (Home)", () => {
  it("shows a few upcoming events and a way to the full list", () => {
    mockUseEvents.mockReturnValue(
      state([make("a:1", "Jazz night", 1), make("b:2", "Story hour", 2), make("c:3", "Council", 3), make("d:4", "Fourth", 4)]),
    );
    const onSeeAll = jest.fn();
    render(<EventsSection onSeeAll={onSeeAll} />);

    expect(screen.getByText("This week")).toBeTruthy();
    expect(screen.getByText("Jazz night")).toBeTruthy();
    expect(screen.getByText("Council")).toBeTruthy();
    // Bounded: three rows on Home, never the whole list.
    expect(screen.queryByText("Fourth")).toBeNull();

    fireEvent.press(screen.getByLabelText("See all events"));
    expect(onSeeAll).toHaveBeenCalled();
  });

  it("renders nothing while loading and nothing when there are no events", () => {
    mockUseEvents.mockReturnValue(state([], { loading: true }));
    const { toJSON, rerender } = render(<EventsSection onSeeAll={jest.fn()} />);
    expect(toJSON()).toBeNull();

    mockUseEvents.mockReturnValue(state([]));
    rerender(<EventsSection onSeeAll={jest.fn()} />);
    expect(toJSON()).toBeNull();
  });
});

describe("EventsScreen", () => {
  const events = [
    make("a:1", "Council meeting", 0, { area: "Downtown & Strip" }),
    make("b:2", "Story hour", 1, { area: "East End" }),
    make("c:3", "Park walk", 2, { area: "Outside the city" }),
  ];

  it("groups by day, builds filter chips from the data, and ends with a finish line", () => {
    mockUseEvents.mockReturnValue(state(events));
    render(<EventsScreen />);

    expect(screen.getByText(/^Today ·/)).toBeTruthy();
    expect(screen.getByText(/^Tomorrow ·/)).toBeTruthy();
    expect(screen.getByLabelText("Downtown & Strip")).toBeTruthy();
    expect(screen.getByLabelText("East End")).toBeTruthy();
    expect(screen.getByLabelText("Outside the city")).toBeTruthy();
    expect(screen.getByText("That's everything for the next 14 days.")).toBeTruthy();
  });

  it("filters to one area when its chip is chosen", () => {
    mockUseEvents.mockReturnValue(state(events));
    render(<EventsScreen />);

    fireEvent.press(screen.getByLabelText("East End"));
    expect(screen.getByText("Story hour")).toBeTruthy();
    expect(screen.queryByText("Council meeting")).toBeNull();

    fireEvent.press(screen.getByLabelText("All"));
    expect(screen.getByText("Council meeting")).toBeTruthy();
  });

  it("says plainly when nothing is listed, without nagging to refresh", () => {
    mockUseEvents.mockReturnValue(state([]));
    render(<EventsScreen />);
    expect(screen.getByText("Nothing listed for the next 14 days.")).toBeTruthy();
    expect(screen.getByText(/Check back tomorrow/)).toBeTruthy();
  });

  it("shows a still skeleton on first load, honouring Reduce Motion", () => {
    mockUseEvents.mockReturnValue(state([], { loading: true }));
    render(<EventsScreen />);
    expect(screen.getByTestId("events-skeleton")).toBeTruthy();
  });

  it("names organizers that failed while still showing the rest", () => {
    mockUseEvents.mockReturnValue(state(events, { failedSources: ["Kidsburgh"] }));
    render(<EventsScreen />);
    expect(screen.getByText("Couldn't reach Kidsburgh. Showing what we have.")).toBeTruthy();
    expect(screen.getByText("Council meeting")).toBeTruthy();
  });

  it("opens the detail sheet from a card", () => {
    mockUseEvents.mockReturnValue(state(events));
    render(<EventsScreen />);
    fireEvent.press(screen.getByLabelText(/^Story hour,/));
    expect(screen.getByLabelText("Add to calendar")).toBeTruthy();
    expect(screen.getByLabelText("Open on b")).toBeTruthy();
  });
});

describe("EventDetailSheet", () => {
  const event = make("kidsburgh:1", "Family story hour", 1, { sourceName: "Kidsburgh", summary: "Stories & songs." });

  beforeEach(() => jest.clearAllMocks());

  it("hands the event to the calendar and reports a save", async () => {
    (addEventToCalendar as jest.Mock).mockResolvedValue("saved");
    render(<EventDetailSheet event={event} onClose={jest.fn()} />);

    fireEvent.press(screen.getByLabelText("Add to calendar"));

    await waitFor(() => expect(screen.getByText("Added to your calendar.")).toBeTruthy());
    expect(addEventToCalendar).toHaveBeenCalledWith(event);
  });

  it("explains the browser fallback and a failure", async () => {
    (addEventToCalendar as jest.Mock).mockResolvedValueOnce("link");
    render(<EventDetailSheet event={event} onClose={jest.fn()} />);
    fireEvent.press(screen.getByLabelText("Add to calendar"));
    await waitFor(() => expect(screen.getByText("Opened a calendar link in your browser.")).toBeTruthy());

    (addEventToCalendar as jest.Mock).mockResolvedValueOnce("failed");
    fireEvent.press(screen.getByLabelText("Add to calendar"));
    await waitFor(() => expect(screen.getByText(/Couldn't open a calendar/)).toBeTruthy());
  });

  it("stays quiet when the person cancels the calendar screen", async () => {
    (addEventToCalendar as jest.Mock).mockResolvedValue("canceled");
    render(<EventDetailSheet event={event} onClose={jest.fn()} />);
    fireEvent.press(screen.getByLabelText("Add to calendar"));
    await waitFor(() => expect(addEventToCalendar).toHaveBeenCalled());
    expect(screen.getByText(/Abridgd never reads your calendar/)).toBeTruthy();
  });

  it("keeps the sheet inside the screen and scrolls its content", () => {
    render(<EventDetailSheet event={event} onClose={jest.fn()} />);
    const scroll = screen.getByTestId("event-detail-scroll");
    // The actions live inside the scroll view, so they stay reachable when content overflows.
    expect(within(scroll).getByLabelText("Add to calendar")).toBeTruthy();
    expect(within(scroll).getByLabelText("Share event")).toBeTruthy();
    expect(within(scroll).getByText(/Open on Kidsburgh/)).toBeTruthy();
  });

  describe("event photo", () => {
    const withPhoto = { ...event, imageUrl: "https://cdn.example.com/event.jpg" };

    it("shows the organizer's photo, decorative to screen readers", () => {
      render(<EventDetailSheet event={withPhoto} onClose={jest.fn()} />);
      const photo = screen.getByTestId("event-photo");
      expect(photo.props.source).toEqual({ uri: "https://cdn.example.com/event.jpg" });
      expect(photo.props.accessible).toBe(false);
    });

    it("shows nothing when the event has no photo", () => {
      render(<EventDetailSheet event={event} onClose={jest.fn()} />);
      expect(screen.queryByTestId("event-photo")).toBeNull();
    });

    it("drops the photo if it fails to load, keeping the rest of the sheet", () => {
      render(<EventDetailSheet event={withPhoto} onClose={jest.fn()} />);
      fireEvent(screen.getByTestId("event-photo"), "error");
      expect(screen.queryByTestId("event-photo")).toBeNull();
      expect(screen.getByLabelText("Add to calendar")).toBeTruthy();
    });

    it("shows no photo in text-only image mode", () => {
      mockImageMode = "text-only";
      render(<EventDetailSheet event={withPhoto} onClose={jest.fn()} />);
      expect(screen.queryByTestId("event-photo")).toBeNull();
      mockImageMode = "full";
    });
  });

  it("renders nothing without an event and closes from the close button", () => {
    const { toJSON, rerender } = render(<EventDetailSheet event={null} onClose={jest.fn()} />);
    expect(toJSON()).toBeNull();

    const onClose = jest.fn();
    rerender(<EventDetailSheet event={event} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});
