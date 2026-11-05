import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useProfilesOptional } from "../../context/ProfileContext";
import {
  getSavedEventsStorageKey,
  loadSavedEvents,
  saveSavedEvents,
} from "./savedEventsStorage";
import { AppEvent } from "./types";

interface SavedEventsContextType {
  savedEvents: AppEvent[];
  isEventSaved: (eventId: string) => boolean;
  /** Saves the event, or removes it if it is already saved. Returns whether it is saved now. */
  toggleSavedEvent: (event: AppEvent) => boolean;
  isLoading: boolean;
}

const SavedEventsContext = createContext<SavedEventsContextType | undefined>(undefined);

export const SavedEventsProvider = ({ children }: { children: React.ReactNode }) => {
  const profileContext = useProfilesOptional?.() ?? undefined;
  const storageKey = useMemo(
    () => getSavedEventsStorageKey(profileContext?.activeProfile?.id),
    [profileContext?.activeProfile?.id],
  );
  const [savedEvents, setSavedEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // The key whose data loaded successfully. Autosave runs only for that key, so a failed read
  // (or a profile switch that has not finished loading) can never write over stored events.
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setHydratedKey(null);
    loadSavedEvents(storageKey)
      .then((events) => {
        if (cancelled) return;
        setSavedEvents(events);
        setHydratedKey(storageKey);
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn("Saved events could not be read; leaving the stored copy untouched", error?.name);
        setSavedEvents([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (isLoading || hydratedKey !== storageKey) return;
    const timeout = setTimeout(() => {
      saveSavedEvents(savedEvents, storageKey).catch((error) =>
        console.warn("Saved events could not be written", error?.name),
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [savedEvents, isLoading, hydratedKey, storageKey]);

  const savedIds = useMemo(() => new Set(savedEvents.map((e) => e.id)), [savedEvents]);
  const isEventSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  const toggleSavedEvent = useCallback(
    (event: AppEvent) => {
      const willBeSaved = !savedIds.has(event.id);
      setSavedEvents((prev) =>
        prev.some((e) => e.id === event.id) ? prev.filter((e) => e.id !== event.id) : [...prev, event],
      );
      return willBeSaved;
    },
    [savedIds],
  );

  const value = useMemo(
    () => ({ savedEvents, isEventSaved, toggleSavedEvent, isLoading }),
    [savedEvents, isEventSaved, toggleSavedEvent, isLoading],
  );

  return <SavedEventsContext.Provider value={value}>{children}</SavedEventsContext.Provider>;
};

/** No-op fallback so presentational components render without the provider (as with saved articles). */
const FALLBACK: SavedEventsContextType = {
  savedEvents: [],
  isEventSaved: () => false,
  toggleSavedEvent: () => false,
  isLoading: false,
};

export const useSavedEventsOptional = (): SavedEventsContextType =>
  useContext(SavedEventsContext) ?? FALLBACK;
