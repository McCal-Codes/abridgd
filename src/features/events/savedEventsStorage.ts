import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageReadError, backupRawValue } from "../../utils/storageRecovery";
import { AppEvent } from "./types";

const SAVED_EVENTS_KEY = "@abridged_saved_events";
const SCHEMA_VERSION = 1;
/** Saved events stay for a month after they end, then drop out on their own. */
export const SAVED_EVENT_GRACE_MS = 30 * 24 * 3600_000;

interface Envelope {
  version: number;
  events: AppEvent[];
  timestamp: number;
}

export const getSavedEventsStorageKey = (profileId?: string | null): string =>
  `${SAVED_EVENTS_KEY}_${profileId ?? "default"}`;

export const serializeSavedEvents = (events: AppEvent[]): string =>
  JSON.stringify({ version: SCHEMA_VERSION, events, timestamp: Date.now() } satisfies Envelope);

const isEvent = (value: unknown): value is AppEvent => {
  const e = value as AppEvent | null;
  return Boolean(
    e &&
      typeof e.id === "string" &&
      typeof e.title === "string" &&
      typeof e.startsAt === "number" &&
      typeof e.localDate === "string" &&
      typeof e.url === "string",
  );
};

/** Drops events that ended more than the grace period ago. */
export const pruneSavedEvents = (events: AppEvent[], now: number): AppEvent[] =>
  events.filter((e) => (e.endsAt ?? e.startsAt) + SAVED_EVENT_GRACE_MS >= now);

/**
 * Same contract as the saved-articles loader: nothing stored is `[]`; damaged data is backed up
 * and starts empty; a newer schema or a read that keeps failing throws `StorageReadError`, so the
 * caller never autosaves over data it could not read.
 */
export const loadSavedEvents = async (storageKey: string, now: number = Date.now()): Promise<AppEvent[]> => {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(storageKey);
  } catch {
    throw new StorageReadError("transient", "Failed to load saved events");
  }
  if (!raw) return [];

  let parsed: Envelope;
  try {
    parsed = JSON.parse(raw) as Envelope;
  } catch {
    await backupRawValue(storageKey, raw);
    return [];
  }

  if (parsed?.version !== SCHEMA_VERSION) {
    await backupRawValue(storageKey, raw);
    throw new StorageReadError("unsupported-version", `Saved events schema ${String(parsed?.version)}`);
  }

  return pruneSavedEvents((Array.isArray(parsed.events) ? parsed.events : []).filter(isEvent), now);
};

export const saveSavedEvents = async (events: AppEvent[], storageKey: string): Promise<void> => {
  await AsyncStorage.setItem(storageKey, serializeSavedEvents(events));
};

export const clearSavedEvents = async (storageKey: string): Promise<void> => {
  await AsyncStorage.removeItem(storageKey);
};
