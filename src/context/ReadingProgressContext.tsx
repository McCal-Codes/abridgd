import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { ReadingProgress, ReadingProgressState } from "../types/ReadingProgress";
import {
  loadReadingProgress,
  saveReadingProgress,
  updateArticleProgress,
  getInProgressArticles,
  getReadingStats,
  clearArticleProgress,
} from "../utils/readingProgressStorage";
import { useProfiles } from "./ProfileContext";

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
  const [inProgressArticles, setInProgressArticles] = useState<ReadingProgress[]>([]);
  const [readingStats, setReadingStats] = useState({
    totalArticlesRead: 0,
    totalReadTimeSeconds: 0,
    averageCompletionPercentage: 0,
    articlesInProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackArticleRead } = useProfiles();

  // Initialize: Load reading progress on app start
  useEffect(() => {
    const initializeProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await loadReadingProgress();
        setProgressData(data);

        // Load in-progress articles and stats
        const inProgress = await getInProgressArticles();
        setInProgressArticles(inProgress);

        const stats = await getReadingStats();
        setReadingStats(stats);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load reading progress";
        console.error("Reading progress initialization error:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProgress();
  }, []);

  // Auto-save to AsyncStorage whenever progressData changes
  useEffect(() => {
    if (!isLoading) {
      const saveToStorage = async () => {
        try {
          await saveReadingProgress(progressData);
          setError(null);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to save reading progress";
          console.error("Reading progress save error:", err);
          setError(errorMessage);
        }
      };

      // Debounce saves to avoid excessive writes
      const timeout = setTimeout(saveToStorage, 500);
      return () => clearTimeout(timeout);
    }
  }, [progressData, isLoading]);

  const updateProgress = useCallback(
    async (articleId: string, updates: Partial<ReadingProgress>) => {
      try {
        const updated = await updateArticleProgress(articleId, updates);
        setProgressData((prev) => {
          const previousStatus = prev[articleId]?.status;
          const next = {
            ...prev,
            [articleId]: updated,
          };

          if (updated.status === "completed" && previousStatus !== "completed") {
            // Defer profile stat update to avoid setState during provider render
            Promise.resolve().then(trackArticleRead);
          }

          return next;
        });

        // Refresh stats if status changed
        if (updates.status) {
          const stats = await getReadingStats();
          setReadingStats(stats);

          const inProgress = await getInProgressArticles();
          setInProgressArticles(inProgress);
        }

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
      await clearArticleProgress(articleId);
      setProgressData((prev) => {
        const updated = { ...prev };
        delete updated[articleId];
        return updated;
      });

      // Refresh stats
      const stats = await getReadingStats();
      setReadingStats(stats);

      const inProgress = await getInProgressArticles();
      setInProgressArticles(inProgress);

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear progress";
      console.error("Clear progress error:", err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const stats = await getReadingStats();
      setReadingStats(stats);

      const inProgress = await getInProgressArticles();
      setInProgressArticles(inProgress);

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh stats";
      console.error("Refresh stats error:", err);
      setError(errorMessage);
    }
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
    // Return a no-op implementation matching ReadingProgressContextType
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
