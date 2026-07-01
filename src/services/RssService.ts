import { Article, ArticleCategory } from "../types/Article";
import { getAllCategories } from "./feed/sourceRegistry";
import { fetchCategory, getCachedCategory, getCategoryFetchedAt } from "./feed/repository";

/**
 * Thin compatibility facade over the modular feed pipeline (src/services/feed/*).
 * Kept permanently rather than migrated away — AiService.fetchDigestArticles() calls
 * fetchArticlesByCategory(category) with no options and shouldn't need to know the feed
 * pipeline was split into source registry / transport / parser / repository layers.
 * See docs/standards/adr/0005-feed-pipeline-modularization.md.
 */

export const getLastFetchedAt = (category: ArticleCategory): number | null =>
  getCategoryFetchedAt(category);

export const getCachedArticles = (category: ArticleCategory): Article[] | null =>
  getCachedCategory(category)?.articles ?? null;

export const fetchArticlesByCategory = async (
  category: ArticleCategory,
  options: { forceRefresh?: boolean } = {},
): Promise<Article[]> => {
  const result = await fetchCategory(category, options);
  return result.articles;
};

export const fetchAllArticles = async (): Promise<Article[]> => {
  const categories = getAllCategories();
  const results = await Promise.all(categories.map((category) => fetchArticlesByCategory(category)));
  return results.flat();
};
