import { renderHook, waitFor } from "@testing-library/react-native";
import { useFullStoryEnrichment } from "../useFullStoryEnrichment";
import { fetchAndCacheFullStory } from "../../services/fullStoryCache";
import type { Article } from "../../types/Article";

jest.mock("../../services/fullStoryCache", () => ({
  fetchAndCacheFullStory: jest.fn(),
}));

const buildArticle = (overrides: Partial<Article>): Article => ({
  id: "1",
  headline: "Headline",
  summary: "",
  body: "short body",
  source: "Source",
  timestamp: "",
  publishedAt: Date.now(),
  category: "Top",
  readTimeMinutes: 1,
  link: "https://example.com/article",
  ...overrides,
});

describe("useFullStoryEnrichment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("triggers enrichment for a short body and applies a longer result", async () => {
    (fetchAndCacheFullStory as jest.Mock).mockResolvedValue({ body: `<p>${"x".repeat(2000)}</p>` });
    const article = buildArticle({ source: "Random Source", body: "short" });

    const { result } = renderHook(({ art, len }: { art: Article; len: number }) => useFullStoryEnrichment(art, len), {
      initialProps: { art: article, len: article.body.length },
    });

    await waitFor(() => expect(result.current.enrichedBody).not.toBeNull(), { timeout: 2000 });
    expect(fetchAndCacheFullStory).toHaveBeenCalledWith(article.link);
  });

  it("surfaces an author scraped from the full story page", async () => {
    (fetchAndCacheFullStory as jest.Mock).mockResolvedValue({
      body: `<p>${"x".repeat(2000)}</p>`,
      author: "Jane Doe",
    });
    const article = buildArticle({ source: "Random Source", body: "short" });

    const { result } = renderHook(({ art, len }: { art: Article; len: number }) => useFullStoryEnrichment(art, len), {
      initialProps: { art: article, len: article.body.length },
    });

    await waitFor(() => expect(result.current.enrichedAuthor).toBe("Jane Doe"), { timeout: 2000 });
  });

  it("triggers enrichment for a known truncated source even with a long body", async () => {
    (fetchAndCacheFullStory as jest.Mock).mockResolvedValue(null);
    const longBody = "y".repeat(1000);
    const article = buildArticle({ source: "WTAE", body: longBody });

    renderHook(({ art, len }: { art: Article; len: number }) => useFullStoryEnrichment(art, len), {
      initialProps: { art: article, len: longBody.length },
    });

    await waitFor(() => expect(fetchAndCacheFullStory).toHaveBeenCalledWith(article.link), {
      timeout: 2000,
    });
  });

  it("does not trigger enrichment for a long body from an unlisted source", async () => {
    const longBody = "z".repeat(1000);
    const article = buildArticle({ source: "Some Other Source", body: longBody });

    renderHook(({ art, len }: { art: Article; len: number }) => useFullStoryEnrichment(art, len), {
      initialProps: { art: article, len: longBody.length },
    });

    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(fetchAndCacheFullStory).not.toHaveBeenCalled();
  });

  it("does not apply a fetched body that is shorter than the current body", async () => {
    (fetchAndCacheFullStory as jest.Mock).mockResolvedValue({ body: "<p>short</p>" });
    const article = buildArticle({ source: "Random Source", body: "a".repeat(50) });

    const { result } = renderHook(({ art, len }: { art: Article; len: number }) => useFullStoryEnrichment(art, len), {
      initialProps: { art: article, len: article.body.length },
    });

    await waitFor(() => expect(fetchAndCacheFullStory).toHaveBeenCalled(), { timeout: 2000 });
    expect(result.current.enrichedBody).toBeNull();
  });

  it("does not re-trigger enrichment on rerender when article.link is unchanged", async () => {
    (fetchAndCacheFullStory as jest.Mock).mockResolvedValue({ body: `<p>${"x".repeat(2000)}</p>` });
    const article = buildArticle({ source: "Random Source", body: "short" });

    const { rerender } = renderHook(({ art, len }: { art: Article; len: number }) => useFullStoryEnrichment(art, len), {
      initialProps: { art: article, len: article.body.length },
    });

    await waitFor(() => expect(fetchAndCacheFullStory).toHaveBeenCalledTimes(1), { timeout: 2000 });

    rerender({ art: article, len: article.body.length });
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(fetchAndCacheFullStory).toHaveBeenCalledTimes(1);
  });
});
