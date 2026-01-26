import React, { createContext, useState, ReactNode, useEffect, useMemo, useContext } from "react";
import { Article } from "../types/Article";
import {
  loadArticlesFromStorage,
  saveArticlesToStorage,
  isMigrationComplete,
  markMigrationComplete,
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
    () => `@abridged_saved_articles_${activeProfileId ?? "default"}`,
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

  // Initialize: Load articles from AsyncStorage on app start
  useEffect(() => {
    let cancelled = false;

    const initializeStorage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if migration has been completed
        const migrationDone = await isMigrationComplete(storageKey);

        // Load articles from storage (namespaced per profile)
        const articles = await loadArticlesFromStorage(3, 100, storageKey);
        if (cancelled) return;
        setSavedArticles(articles);
        syncProfileSavedArticles(articles);

        // Mark migration as complete for future app launches
        if (!migrationDone) {
          await markMigrationComplete(storageKey);
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
  }, [storageKey, syncProfileSavedArticles]);

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

  const saveArticle = (article: Article) => {
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
  };

  const unsaveArticle = (articleId: string) => {
    setSavedArticles((prevArticles) => {
      const next = prevArticles.filter((article) => article.id !== articleId);
      if (next.length !== prevArticles.length) {
        syncProfileSavedArticles(next);
      }
      return next;
    });
  };

  const isArticleSaved = (articleId: string) => {
    return savedArticles.some((article) => article.id === articleId);
  };

  return (
    <SavedArticlesContext.Provider
      value={{ savedArticles, saveArticle, unsaveArticle, isArticleSaved, isLoading, error }}
    >
      {children}
    </SavedArticlesContext.Provider>
  );
};

export const useSavedArticles = () => {
  const context = useContext(SavedArticlesContext);
  if (context === undefined) {
    throw new Error("useSavedArticles must be used within a SavedArticlesProvider");
  }
  return context;
};
