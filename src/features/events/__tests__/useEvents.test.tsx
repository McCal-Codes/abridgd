import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { __resetEventsCacheForTests } from "../eventsCache";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.unmock("../useEvents");
const mockLoadEvents = jest.fn();
jest.mock("../eventsRepository", () => ({
  ...jest.requireActual("../eventsRepository"),
  loadEvents: (...args: unknown[]) => mockLoadEvents(...args),
}));

// eslint-disable-next-line import/first
import { useEvents } from "../useEvents";
import { AppEvent } from "../types";

const future = (id: string): AppEvent => {
  const startsAt = Date.now() + 3 * 3600_000;
  return {
    id,
    title: id,
    startsAt,
    endsAt: startsAt + 3600_000,
    allDay: false,
    localDate: new Date(startsAt).toISOString().slice(0, 10),
    area: "East End",
    url: "https://example.org",
    sourceId: "k",
    sourceName: "K",
  };
};

const Probe = () => {
  const s = useEvents();
  return (
    <>
      <Text testID="loading">{String(s.loading)}</Text>
      <Text testID="count">{s.events.length}</Text>
      <Text testID="error">{s.error ?? "none"}</Text>
      <Text testID="failed">{s.failedSources.join(",") || "none"}</Text>
    </>
  );
};

describe("useEvents", () => {
  beforeEach(async () => {
    mockLoadEvents.mockReset();
    await AsyncStorage.clear();
    __resetEventsCacheForTests();
  });

  it("loads on a cold start and then shows the events", async () => {
    mockLoadEvents.mockResolvedValue({
      events: [future("a"), future("b")],
      failedSources: [],
      lastUpdated: Date.now(),
      stale: false,
    });
    render(<Probe />);
    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("2"));
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });

  it("reports an error only when nothing could be loaded", async () => {
    mockLoadEvents.mockRejectedValue(new Error("Couldn't load events"));
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId("error")).toHaveTextContent("Couldn't load events"));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("surfaces organizers that failed while keeping the rest", async () => {
    mockLoadEvents.mockResolvedValue({
      events: [future("a")],
      failedSources: ["Kidsburgh"],
      lastUpdated: Date.now(),
      stale: false,
    });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId("failed")).toHaveTextContent("Kidsburgh"));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });
});
