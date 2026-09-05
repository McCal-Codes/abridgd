import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
} from "react";
import { Article } from "../types/Article";
import {
  loadArticlesFromStorage,
  saveArticlesToStorage,
  isMigrationComplete,
  markMigrationComplete,
  getSavedArticlesStorageKey,
} from "../utils/storage";
import { useProfilesOptional } from "./ProfileContext";

interface SavedArticlesContextType {
  savedArticles: Article[];
  saveArticle: (article: Article) => void;
  unsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

const SavedArticlesContext = createContext<SavedArticlesContextType | undefined>(undefined);

export const SavedArticlesProvider = ({ children }: { children: ReactNode }) => {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const profileContext = useProfilesOptional?.() ?? undefined;
  const activeProfileId = profileContext?.activeProfile?.id;
  const storageKey = useMemo(
    () => getSavedArticlesStorageKey(activeProfileId),
    [activeProfileId],
  );
  const syncProfileSavedArticles = useMemo(
    () => profileContext?.updateSavedArticles ?? (() => {}),
    [profileContext?.updateSavedArticles],
  );
  const trackSavedAction = useMemo(
    () => profileContext?.trackSavedAction ?? (() => {}),
    [profileContext?.trackSavedAction],
  );

  // Calling syncProfileSavedArticles updates ProfileContext state, which gives it a new
  // identity — if it were a dependency of the effect below, that would re-trigger the very
  // effect that calls it, looping forever. A ref lets the effect call the latest version
  // without needing to react to it changing.
  const syncProfileSavedArticlesRef = useRef(syncProfileSavedArticles);
  useEffect(() => {
    syncProfileSavedArticlesRef.current = syncProfileSavedArticles;
  }, [syncProfileSavedArticles]);

  // Initialize: Load articles from AsyncStorage on app start
  useEffect(() => {
    let cancelled = false;

    const initializeStorage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if migration has been completed
        const migrationDone = await isMigrationComplete();

        // Load articles from storage (namespaced per profile)
        const articles = await loadArticlesFromStorage(3, 100, storageKey);
        if (cancelled) return;
        setSavedArticles(articles);
        syncProfileSavedArticlesRef.current(articles);

        // Mark migration as complete for future app launches
        if (!migrationDone) {
          await markMigrationComplete();
        }
      } catch (err) {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : "Failed to load saved articles";
        console.error("Storage initialization error:", err);
        setError(errorMessage);
        // Continue with empty array on error to avoid blocking the app
        setSavedArticles([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeStorage();

    return () => {
      cancelled = true;
    };
    // Deliberately excludes syncProfileSavedArticles — see the ref above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Auto-save to AsyncStorage whenever savedArticles changes
  useEffect(() => {
    if (!isLoading && savedArticles.length >= 0) {
      const saveToStorage = async () => {
        try {
          await saveArticlesToStorage(savedArticles, 3, 100, storageKey);
          setError(null);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to save articles";
          console.error("Storage save error:", err);
          setError(errorMessage);
        }
      };

      // Debounce saves to avoid excessive writes
      const timeout = setTimeout(saveToStorage, 500);
      return () => clearTimeout(timeout);
    }
  }, [savedArticles, isLoading, storageKey]);

  // Every ArticleCard now consumes this context for swipe-to-save, so a feed is dozens of
  // subscribers. Recreating these functions each render made every one of them a new prop
  // identity, which defeated ArticleCard's React.memo and rebuilt each card's pan gesture.
  const saveArticle = useCallback((article: Article) => {
    setSavedArticles((prevArticles) => {
      // Avoid duplicates
      if (prevArticles.some((a) => a.id === article.id)) {
        return prevArticles;
      }
      const next = [...prevArticles, article];
      syncProfileSavedArticles(next);
      trackSavedAction();
      return next;
    });
  }, [syncProfileSavedArticles, trackSavedAction]);

  const unsaveArticle = useCallback((articleId: string) => {
    setSavedArticles((prevArticles) => {
      const next = prevArticles.filter((article) => article.id !== articleId);
      if (next.length !== prevArticles.length) {
        syncProfileSavedArticles(next);
      }
      return next;
    });
  }, [syncProfileSavedArticles]);

  // A linear scan per card per render is O(cards x saved); a feed of 25 with 200 saved
  // articles was 5,000 comparisons every time anything re-rendered.
  const savedIds = useMemo(
    () => new Set(savedArticles.map((article) => article.id)),
    [savedArticles],
  );

  const isArticleSaved = useCallback((articleId: string) => savedIds.has(articleId), [savedIds]);

  const value = useMemo(
    () => ({ savedArticles, saveArticle, unsaveArticle, isArticleSaved, isLoading, error }),
    [savedArticles, saveArticle, unsaveArticle, isArticleSaved, isLoading, error],
  );

  return <SavedArticlesContext.Provider value={value}>{children}</SavedArticlesContext.Provider>;
};

export const useSavedArticles = () => {
  const context = useContext(SavedArticlesContext);
  if (context === undefined) {
    throw new Error("useSavedArticles must be used within a SavedArticlesProvider");
  }
  return context;
};

/** Safe no-op variant, matching useReadingProgressOptional. Lets presentational components —
 * ArticleCard's swipe-to-save, in particular — reach saved state without every render tree
 * that mounts a card being obliged to provide the context. */
export const useSavedArticlesOptional = (): SavedArticlesContextType => {
  const context = useContext(SavedArticlesContext);
  if (context === undefined) {
    return {
      savedArticles: [],
      saveArticle: (_article: Article) => {},
      unsaveArticle: (_articleId: string) => {},
      isArticleSaved: (_articleId: string) => false,
      isLoading: false,
      error: null,
    } as SavedArticlesContextType;
  }
  return context;
};
