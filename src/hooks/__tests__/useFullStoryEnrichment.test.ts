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
    // The article has a photo, so there is nothing left to fetch the page for. (A long body with
    // no photo does fetch now, to recover the lead image: see the "lead photo" tests below.)
    const article = buildArticle({
      source: "Some Other Source",
      body: longBody,
      imageUrl: "https://cdn.example.com/own.jpg",
    });

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

  describe("lead photo", () => {
    const longBody = "x".repeat(2000);
    const render = (art: Article) =>
      renderHook(({ a }: { a: Article }) => useFullStoryEnrichment(a, a.body.length), { initialProps: { a: art } });

    it("recovers a lead photo for a story whose feed carried none, even with a full-length body", async () => {
      (fetchAndCacheFullStory as jest.Mock).mockResolvedValue({ body: "", imageUrl: "https://cdn.example.com/lead.jpg" });
      const { result } = render(buildArticle({ source: "Random Source", body: longBody }));

      await waitFor(() => expect(result.current.enrichedImageUrl).toBe("https://cdn.example.com/lead.jpg"), { timeout: 2000 });
      expect(result.current.enrichedBody).toBeNull(); // an empty body never replaces the feed's text
    });

    it("does not fetch at all when the story is long and already has a photo", async () => {
      const { result } = render(buildArticle({ source: "Random Source", body: longBody, imageUrl: "https://cdn.example.com/own.jpg" }));
      await new Promise((resolve) => setTimeout(resolve, 700));
      expect(fetchAndCacheFullStory).not.toHaveBeenCalled();
      expect(result.current.enrichedImageUrl).toBeNull();
    });

    it("never replaces a photo the feed supplied", async () => {
      (fetchAndCacheFullStory as jest.Mock).mockResolvedValue({ body: `<p>${"y".repeat(2500)}</p>`, imageUrl: "https://cdn.example.com/page.jpg" });
      const { result } = render(buildArticle({ source: "Random Source", body: "short", imageUrl: "https://cdn.example.com/own.jpg" }));

      await waitFor(() => expect(result.current.enrichedBody).not.toBeNull(), { timeout: 2000 });
      expect(result.current.enrichedImageUrl).toBeNull();
    });

    it("treats feed media images as the story's own photo", async () => {
      const { result } = render(buildArticle({ source: "Random Source", body: longBody, mediaImages: ["https://cdn.example.com/m.jpg"] }));
      await new Promise((resolve) => setTimeout(resolve, 700));
      expect(fetchAndCacheFullStory).not.toHaveBeenCalled();
      expect(result.current.enrichedImageUrl).toBeNull();
    });
  });
});
