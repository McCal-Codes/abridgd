import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ensureEventsHydrated,
  getAllEventsSnapshots,
} from "./eventsCache";
import { EventsLoadResult, getCachedEvents, loadEvents } from "./eventsRepository";
import { selectUpcoming } from "./grouping";
import { AppEvent } from "./types";

export interface EventsState {
  /** Upcoming events inside the 14-day window, in time order. */
  events: AppEvent[];
  /** True only on a genuine cold start: nothing cached, first load in flight. */
  loading: boolean;
  /** True during any background or pull-triggered revalidation. */
  refreshing: boolean;
  /** Set only when nothing could be loaded at all. */
  error: string | null;
  /** True when the shown data is older than the soft TTL. */
  stale: boolean;
  /** Organizers that failed on the last attempt (their last good events are still shown). */
  failedSources: string[];
  lastUpdated: Date | null;
  refresh: () => Promise<{ count: number; failed: boolean }>;
}

/**
 * Cache-first events for the Home card and the Events screen. Cached events appear immediately;
 * a background refresh runs only when the cache is past its TTL. Pull-to-refresh forces a fetch.
 * Mirrors `useCategoryFeed` so events behave like the rest of the app.
 */
export const useEvents = (): EventsState => {
  const [result, setResult] = useState<EventsLoadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async (force: boolean): Promise<EventsLoadResult | null> => {
    try {
      const next = await loadEvents({ force });
      if (mounted.current) {
        setResult(next);
        setError(null);
      }
      return next;
    } catch (e) {
      if (mounted.current) {
        // A failed refresh with something already on screen is not an error state.
        setError(e instanceof Error && e.message ? e.message : "Couldn't load events");
      }
      return null;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      await ensureEventsHydrated();
      if (!mounted.current) return;
      const cached = getCachedEvents();
      const hasCache = getAllEventsSnapshots().length > 0;
      if (hasCache) {
        setResult(cached);
        setLoading(false);
      }
      if (!hasCache || cached.stale) {
        if (hasCache) setRefreshing(true);
        await load(false);
        if (mounted.current) {
          setRefreshing(false);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const next = await load(true);
    if (mounted.current) setRefreshing(false);
    return {
      count: next ? selectUpcoming(next.events, Date.now()).length : 0,
      failed: !next || next.failedSources.length > 0,
    };
  }, [load]);

  const events = useMemo(() => selectUpcoming(result?.events ?? [], Date.now()), [result]);

  return {
    events,
    loading,
    refreshing,
    // Only an error when there is nothing to show.
    error: events.length === 0 && result === null ? error : null,
    stale: result?.stale ?? false,
    failedSources: result?.failedSources ?? [],
    lastUpdated: result?.lastUpdated ? new Date(result.lastUpdated) : null,
    refresh,
  };
};
