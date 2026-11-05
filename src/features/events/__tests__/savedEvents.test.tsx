import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavedEventsProvider, useSavedEventsOptional } from "../SavedEventsContext";
import {
  getSavedEventsStorageKey,
  loadSavedEvents,
  pruneSavedEvents,
  SAVED_EVENT_GRACE_MS,
  serializeSavedEvents,
} from "../savedEventsStorage";
import { AppEvent } from "../types";

const NOW = Date.UTC(2026, 10, 5, 15, 0);

const event = (id: string, startsAt = NOW + 86400_000): AppEvent => ({
  id,
  title: id,
  startsAt,
  allDay: false,
  localDate: "2026-11-06",
  area: "East End",
  url: "https://example.org/e",
  sourceId: "k",
  sourceName: "K",
});

describe("saved events storage", () => {
  const key = getSavedEventsStorageKey("p1");

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("scopes the key per profile", () => {
    expect(getSavedEventsStorageKey("p1")).toBe("@abridged_saved_events_p1");
    expect(getSavedEventsStorageKey()).toBe("@abridged_saved_events_default");
  });

  it("round-trips events and starts empty when nothing is stored", async () => {
    await expect(loadSavedEvents(key, NOW)).resolves.toEqual([]);
    await AsyncStorage.setItem(key, serializeSavedEvents([event("a")]));
    await expect(loadSavedEvents(key, NOW)).resolves.toEqual([event("a")]);
  });

  it("drops events that ended more than a month ago", () => {
    const old = event("old", NOW - SAVED_EVENT_GRACE_MS - 1000);
    expect(pruneSavedEvents([old, event("new")], NOW).map((e) => e.id)).toEqual(["new"]);
  });

  it("backs up damaged data and starts empty", async () => {
    await AsyncStorage.setItem(key, "{broken");
    await expect(loadSavedEvents(key, NOW)).resolves.toEqual([]);
    expect(await AsyncStorage.getItem(`${key}.bak`)).toBe("{broken");
  });

  it("refuses a newer schema without discarding it", async () => {
    const newer = JSON.stringify({ version: 9, events: [], timestamp: 1 });
    await AsyncStorage.setItem(key, newer);
    await expect(loadSavedEvents(key, NOW)).rejects.toMatchObject({ reason: "unsupported-version" });
    expect(await AsyncStorage.getItem(`${key}.bak`)).toBe(newer);
  });

  it("skips malformed entries but keeps the good ones", async () => {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({ version: 1, events: [event("ok"), { id: 5 }, null], timestamp: 1 }),
    );
    expect((await loadSavedEvents(key, NOW)).map((e) => e.id)).toEqual(["ok"]);
  });
});

describe("SavedEventsProvider", () => {
  const Probe = ({ ev }: { ev: AppEvent }) => {
    const { savedEvents, isEventSaved, toggleSavedEvent } = useSavedEventsOptional();
    return (
      <>
        <Text testID="count">{savedEvents.length}</Text>
        <Text testID="saved">{isEventSaved(ev.id) ? "yes" : "no"}</Text>
        <Pressable testID="toggle" onPress={() => toggleSavedEvent(ev)}>
          <Text>toggle</Text>
        </Pressable>
      </>
    );
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.useFakeTimers();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("saves, toggles off, and persists after the debounce", async () => {
    const ev = event("a");
    render(
      <SavedEventsProvider>
        <Probe ev={ev} />
      </SavedEventsProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("saved")).toHaveTextContent("no"));

    fireEvent.press(screen.getByTestId("toggle"));
    await waitFor(() => expect(screen.getByTestId("saved")).toHaveTextContent("yes"));
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    const stored = JSON.parse((await AsyncStorage.getItem(getSavedEventsStorageKey()))!);
    expect(stored.events.map((e: AppEvent) => e.id)).toEqual(["a"]);

    fireEvent.press(screen.getByTestId("toggle"));
    await waitFor(() => expect(screen.getByTestId("saved")).toHaveTextContent("no"));
  });

  it("never writes over stored events it could not read", async () => {
    const newer = JSON.stringify({ version: 9, events: [event("keep")], timestamp: 1 });
    await AsyncStorage.setItem(getSavedEventsStorageKey(), newer);
    const setItem = jest.spyOn(AsyncStorage, "setItem");
    setItem.mockClear(); // the spy is shared across tests; only count writes from this one

    render(
      <SavedEventsProvider>
        <Probe ev={event("a")} />
      </SavedEventsProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"));
    fireEvent.press(screen.getByTestId("toggle"));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Only the .bak copy may be written; the original key must be untouched.
    const wroteOriginal = setItem.mock.calls.some(([k]) => k === getSavedEventsStorageKey());
    expect(wroteOriginal).toBe(false);
    expect(await AsyncStorage.getItem(getSavedEventsStorageKey())).toBe(newer);
  });

  it("falls back to a no-op outside the provider", () => {
    render(<Probe ev={event("a")} />);
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
