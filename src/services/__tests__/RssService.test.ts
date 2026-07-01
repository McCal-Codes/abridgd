import type { ArticleCategory } from "../../types/Article";

const mockFetchCategory = jest.fn();
const mockGetCachedCategory = jest.fn();
const mockGetCategoryFetchedAt = jest.fn();

jest.mock("../feed/repository", () => ({
  fetchCategory: (...args: unknown[]) => mockFetchCategory(...args),
  getCachedCategory: (...args: unknown[]) => mockGetCachedCategory(...args),
  getCategoryFetchedAt: (...args: unknown[]) => mockGetCategoryFetchedAt(...args),
}));

jest.mock("../feed/sourceRegistry", () => ({
  getAllCategories: () => ["Top", "Local"],
}));

import { fetchArticlesByCategory, fetchAllArticles, getCachedArticles, getLastFetchedAt } from "../RssService";

const sampleArticle = {
  id: "1",
  headline: "A",
  summary: "",
  body: "",
  source: "Source",
  timestamp: "",
  publishedAt: Date.now(),
  category: "Top" as ArticleCategory,
  readTimeMinutes: 1,
};

describe("RssService facade", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates fetchArticlesByCategory to feed/repository.fetchCategory and unwraps the result", async () => {
    mockFetchCategory.mockResolvedValue({ articles: [sampleArticle], stale: false, lastUpdated: 123 });

    const articles = await fetchArticlesByCategory("Top" as ArticleCategory, { forceRefresh: true });

    expect(mockFetchCategory).toHaveBeenCalledWith("Top", { forceRefresh: true });
    expect(articles).toEqual([sampleArticle]);
  });

  it("delegates getCachedArticles to feed/repository.getCachedCategory and unwraps articles", () => {
    mockGetCachedCategory.mockReturnValue({ articles: [sampleArticle], stale: false, lastUpdated: 123 });

    expect(getCachedArticles("Top" as ArticleCategory)).toEqual([sampleArticle]);
  });

  it("returns null from getCachedArticles when there is no cached category result", () => {
    mockGetCachedCategory.mockReturnValue(null);

    expect(getCachedArticles("Top" as ArticleCategory)).toBeNull();
  });

  it("delegates getLastFetchedAt to feed/repository.getCategoryFetchedAt", () => {
    mockGetCategoryFetchedAt.mockReturnValue(42);

    expect(getLastFetchedAt("Top" as ArticleCategory)).toBe(42);
    expect(mockGetCategoryFetchedAt).toHaveBeenCalledWith("Top");
  });

  it("fetchAllArticles fans out across every category and flattens the results", async () => {
    mockFetchCategory.mockResolvedValue({ articles: [sampleArticle], stale: false, lastUpdated: 123 });

    const articles = await fetchAllArticles();

    expect(mockFetchCategory).toHaveBeenCalledTimes(2);
    expect(articles).toEqual([sampleArticle, sampleArticle]);
  });
});
