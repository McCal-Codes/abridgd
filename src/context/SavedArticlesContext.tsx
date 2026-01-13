import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Article } from '../types/Article';

interface SavedArticlesContextType {
  savedArticles: Article[];
  saveArticle: (article: Article) => void;
  unsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
}

const SavedArticlesContext = createContext<SavedArticlesContextType | undefined>(undefined);

export const SavedArticlesProvider = ({ children }: { children: ReactNode }) => {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);

  const saveArticle = (article: Article) => {
    setSavedArticles((prevArticles) => [...prevArticles, article]);
  };

  const unsaveArticle = (articleId: string) => {
    setSavedArticles((prevArticles) => prevArticles.filter((article) => article.id !== articleId));
  };

  const isArticleSaved = (articleId: string) => {
    return savedArticles.some((article) => article.id === articleId);
  };

  return (
    <SavedArticlesContext.Provider value={{ savedArticles, saveArticle, unsaveArticle, isArticleSaved }}>
      {children}
    </SavedArticlesContext.Provider>
  );
};

export const useSavedArticles = () => {
  const context = useContext(SavedArticlesContext);
  if (context === undefined) {
    throw new Error('useSavedArticles must be used within a SavedArticlesProvider');
  }
  return context;
};
