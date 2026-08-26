import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useCategoryFeed } from "../useCategoryFeed";
import { fetchCategory, getCachedCategory } from "../../services/feed/repository";
import { ensureHydrated } from "../../services/feed/cacheStore";
import type { Article, ArticleCategory } from "../../types/Article";

jest.mock("../../services/feed/repository", () => ({
  fetchCategory: jest.fn(),
  getCachedCategory: jest.fn(),
}));

jest.mock("../../services/feed/cacheStore", () => ({
  ensureHydrated: jest.fn(() => Promise.resolve()),
}));

const buildArticle = (overrides: Partial<Article>): Article => ({
  id: "1",
  headline: "Headline",
  summary: "",
  body: "",
  source: "Source",
  timestamp: "",
  publishedAt: Date.now(),
  category: "Top",
  readTimeMinutes: 1,
  ...overrides,
});

const CATEGORY = "Top" as ArticleCategory;

describe("useCategoryFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ensureHydrated as jest.Mock).mockResolvedValue(undefined);
  });

  it("shows cached articles immediately with no loading spinner, and does not fetch when fresh", async () => {
    (getCachedCategory as jest.Mock).mockReturnValue({
      articles: [buildArticle({ id: "1", headline: "Cached" })],
      stale: false,
      lastUpdated: Date.now(),
    });

    const { result } = renderHook(() => useCategoryFeed(CATEGORY));

    expect(result.current.articles).toHaveLength(1);
    expect(result.current.loading).toBe(false);

    await waitFor(() => expect(ensureHydrated).toHaveBeenCalled());
    expect(fetchCategory).not.toHaveBeenCalled();
  });

  it("revalidates in the background without ever toggling loading when cache is stale", async () => {
    (getCachedCategory as jest.Mock).mockReturnValue({
      articles: [buildArticle({ id: "1", headline: "Cached" })],
      stale: true,
      lastUpdated: Date.now() - 10 * 60 * 1000,
    });
    (fetchCategory as jest.Mock).mockResolvedValue({
      articles: [buildArticle({ id: "2", headline: "Fresh" })],
      stale: false,
      lastUpdated: Date.now(),
    });

    const { result } = renderHook(() => useCategoryFeed(CATEGORY));

    // Never blocks on the cached-first render, even though a background revalidate follows.
    expect(result.current.loading).toBe(false);

    await waitFor(() => expect(result.current.articles[0]?.headline).toBe("Fresh"));
    expect(result.current.loading).toBe(false);
  });

  it("shows loading only on a genuine cold start with no cache", async () => {
    (getCachedCategory as jest.Mock).mockReturnValue(null);
    (fetchCategory as jest.Mock).mockResolvedValue({
      articles: [buildArticle({ id: "1", headline: "First load" })],
      stale: false,
      lastUpdated: Date.now(),
    });

    const { result } = renderHook(() => useCategoryFeed(CATEGORY));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.articles).toHaveLength(1);
  });

  it("refresh() preserves existing articles when the forced fetch fails", async () => {
    (getCachedCategory as jest.Mock).mockReturnValue({
      articles: [buildArticle({ id: "1", headline: "Existing" })],
      stale: false,
      lastUpdated: Date.now(),
    });
    (fetchCategory as jest.Mock).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useCategoryFeed(CATEGORY));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.articles).toHaveLength(1);
    expect(result.current.articles[0].headline).toBe("Existing");
    expect(result.current.error).toBe("boom");
    expect(fetchCategory).toHaveBeenCalledWith(CATEGORY, { forceRefresh: true });
  });
});
