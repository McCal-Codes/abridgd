import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ReadingProgress, ReadingProgressState } from "../types/ReadingProgress";
import {
  clearAllReadingProgress,
  getInProgressArticlesFromState,
  getReadingProgressStorageKey,
  getReadingStatsFromState,
  loadReadingProgress,
  mergeReadingProgress,
  removeReadingProgress,
  saveReadingProgress,
} from "../utils/readingProgressStorage";
import { useProfilesOptional } from "./ProfileContext";

interface ReadingProgressContextType {
  progressData: ReadingProgressState;
  isLoading: boolean;
  error: string | null;
  updateProgress: (articleId: string, updates: Partial<ReadingProgress>) => Promise<void>;
  getProgress: (articleId: string) => ReadingProgress | undefined;
  clearProgress: (articleId: string) => Promise<void>;
  inProgressArticles: ReadingProgress[];
  readingStats: {
    totalArticlesRead: number;
    totalReadTimeSeconds: number;
    averageCompletionPercentage: number;
    articlesInProgress: number;
  };
  refreshStats: () => Promise<void>;
}

const ReadingProgressContext = createContext<ReadingProgressContextType | undefined>(undefined);

export const ReadingProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progressData, setProgressData] = useState<ReadingProgressState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null);
  const profileContext = useProfilesOptional?.() ?? undefined;
  const activeProfileId = profileContext?.activeProfile?.id;
  const trackArticleRead = useMemo(
    () => profileContext?.trackArticleRead ?? (() => {}),
    [profileContext?.trackArticleRead],
  );
  const storageKey = useMemo(
    () => getReadingProgressStorageKey(activeProfileId),
    [activeProfileId],
  );

  const inProgressArticles = useMemo(
    () => getInProgressArticlesFromState(progressData),
    [progressData],
  );
  const readingStats = useMemo(() => getReadingStatsFromState(progressData), [progressData]);

  // Initialize: Load reading progress on app start and whenever the active profile changes.
  useEffect(() => {
    let cancelled = false;

    const initializeProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setHydratedStorageKey(null);

        let data = await loadReadingProgress(3, 100, storageKey);

        // One-time migration from the old global key to the active profile's key.
        if (activeProfileId && Object.keys(data).length === 0) {
          const legacyData = await loadReadingProgress();
          if (Object.keys(legacyData).length > 0) {
            data = legacyData;
            await saveReadingProgress(legacyData, 3, 100, storageKey);
            await clearAllReadingProgress();
          }
        }

        if (cancelled) return;
        setProgressData(data);
        setHydratedStorageKey(storageKey);
      } catch (err) {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : "Failed to load reading progress";
        console.error("Reading progress initialization error:", err);
        setError(errorMessage);
        setProgressData({});
        setHydratedStorageKey(storageKey);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeProgress();

    return () => {
      cancelled = true;
    };
  }, [activeProfileId, storageKey]);

  // Auto-save to AsyncStorage whenever progressData changes.
  useEffect(() => {
    if (!isLoading && hydratedStorageKey === storageKey) {
      const saveToStorage = async () => {
        try {
          await saveReadingProgress(progressData, 3, 100, storageKey);
          setError(null);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to save reading progress";
          console.error("Reading progress save error:", err);
          setError(errorMessage);
        }
      };

      const timeout = setTimeout(saveToStorage, 500);
      return () => clearTimeout(timeout);
    }
  }, [progressData, isLoading, storageKey, hydratedStorageKey]);

  const updateProgress = useCallback(
    async (articleId: string, updates: Partial<ReadingProgress>) => {
      try {
        setProgressData((prev) => {
          const previousStatus = prev[articleId]?.status;
          const next = mergeReadingProgress(prev, articleId, updates);
          const updated = next[articleId];

          if (updated.status === "completed" && previousStatus !== "completed") {
            Promise.resolve().then(trackArticleRead);
          }

          return next;
        });
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update progress";
        console.error("Update progress error:", err);
        setError(errorMessage);
        throw err;
      }
    },
    [trackArticleRead],
  );

  const getProgress = useCallback(
    (articleId: string): ReadingProgress | undefined => {
      return progressData[articleId];
    },
    [progressData],
  );

  const clearProgress = useCallback(async (articleId: string) => {
    try {
      setProgressData((prev) => removeReadingProgress(prev, articleId));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear progress";
      console.error("Clear progress error:", err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    setError(null);
  }, []);

  return (
    <ReadingProgressContext.Provider
      value={{
        progressData,
        isLoading,
        error,
        updateProgress,
        getProgress,
        clearProgress,
        inProgressArticles,
        readingStats,
        refreshStats,
      }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
};

export const useReadingProgress = () => {
  const context = useContext(ReadingProgressContext);
  if (context === undefined) {
    throw new Error("useReadingProgress must be used within a ReadingProgressProvider");
  }
  return context;
};

// Optional hook that returns a safe no-op implementation when provider is not present.
export const useReadingProgressOptional = () => {
  const context = useContext(ReadingProgressContext);
  if (context === undefined) {
    return {
      progressData: {},
      isLoading: false,
      error: null,
      updateProgress: async (_articleId: string, _updates: Partial<ReadingProgress>) => {},
      getProgress: (_articleId: string) => undefined,
      clearProgress: async (_articleId: string) => {},
      inProgressArticles: [],
      readingStats: {
        totalArticlesRead: 0,
        totalReadTimeSeconds: 0,
        averageCompletionPercentage: 0,
        articlesInProgress: 0,
      },
      refreshStats: async () => {},
    } as ReadingProgressContextType;
  }

  return context;
};
