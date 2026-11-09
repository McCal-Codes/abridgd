import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventsSnapshot } from "./types";

const KEY_PREFIX = "abridged:eventsCache:v1:";
const keyFor = (sourceId: string) => `${KEY_PREFIX}${sourceId}`;

/** In-memory mirror of the persisted snapshots, so a screen can read cached events without
 * waiting on AsyncStorage. AsyncStorage stays the source of truth. Same shape of cache as the
 * article feeds (`services/feed/cacheStore.ts`). */
const mirror = new Map<string, EventsSnapshot>();
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;

const isSnapshot = (value: unknown): value is EventsSnapshot => {
  const v = value as EventsSnapshot | null;
  return Boolean(
    v &&
      v.schemaVersion === 1 &&
      typeof v.sourceId === "string" &&
      Array.isArray(v.events) &&
      typeof v.fetchedAt === "number",
  );
};

const hydrate = async (): Promise<void> => {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(KEY_PREFIX));
    if (keys.length === 0) return;
    const entries = await AsyncStorage.multiGet(keys);
    entries.forEach(([, value]) => {
      if (!value) return;
      try {
        const parsed: unknown = JSON.parse(value);
        if (isSnapshot(parsed)) mirror.set(parsed.sourceId, parsed);
      } catch {
        // A corrupt snapshot is only a cache miss.
      }
    });
  } catch (error) {
    console.warn("Failed to hydrate events cache", error);
  } finally {
    hydrated = true;
  }
};

export const ensureEventsHydrated = (): Promise<void> => {
  if (hydrated) return Promise.resolve();
  if (!hydrationPromise) hydrationPromise = hydrate();
  return hydrationPromise;
};

export const getEventsSnapshot = (sourceId: string): EventsSnapshot | null =>
  mirror.get(sourceId) ?? null;

export const getAllEventsSnapshots = (): EventsSnapshot[] => Array.from(mirror.values());

export const writeEventsSnapshot = async (snapshot: EventsSnapshot): Promise<void> => {
  mirror.set(snapshot.sourceId, snapshot);
  try {
    await AsyncStorage.setItem(keyFor(snapshot.sourceId), JSON.stringify(snapshot));
  } catch (error) {
    console.warn(`Failed to persist events cache for ${snapshot.sourceId}`, error);
  }
};

/** Records a failed attempt without disturbing the last good events. */
export const touchEventsAttempt = async (sourceId: string, attemptedAt: number): Promise<void> => {
  const existing = mirror.get(sourceId);
  if (!existing) return;
  await writeEventsSnapshot({ ...existing, attemptedAt });
};

/** Drops snapshots for sources that are no longer configured. */
export const pruneOrphanedEventsCache = async (configuredIds: readonly string[]): Promise<number> => {
  try {
    const valid = new Set(configuredIds.map(keyFor));
    const keys = await AsyncStorage.getAllKeys();
    const orphans = keys.filter((key) => key.startsWith(KEY_PREFIX) && !valid.has(key));
    if (orphans.length === 0) return 0;
    orphans.forEach((key) => mirror.delete(key.slice(KEY_PREFIX.length)));
    await AsyncStorage.multiRemove(orphans);
    return orphans.length;
  } catch (error) {
    console.warn("Failed to prune orphaned events cache", error);
    return 0;
  }
};

export const clearAllEventsCache = async (): Promise<void> => {
  mirror.clear();
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(KEY_PREFIX));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.warn("Failed to clear events cache", error);
  }
};

/** Test-only: back to a not-yet-hydrated, empty cache. */
export const __resetEventsCacheForTests = (): void => {
  mirror.clear();
  hydrated = false;
  hydrationPromise = null;
};
