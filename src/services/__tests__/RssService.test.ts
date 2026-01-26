import type { ArticleCategory } from "../../types/Article";

// Mocks
const mockLoadSourcePrefs = jest.fn(async () => ({ overrides: {}, customFeeds: [] }));
const mockIsSourceEnabled = jest.fn(() => true);

jest.mock("../../data/feedConfig", () => ({
  RSS_FEEDS: {
    Top: [{ name: "Mock Feed", url: "https://example.com/rss" }],
  },
}));

jest.mock("../../utils/sourcePreferences", () => ({
  loadSourcePreferences: (...args: unknown[]) => mockLoadSourcePrefs(...args),
  isSourceEnabled: (...args: unknown[]) => mockIsSourceEnabled(...args),
}));

// Helper to import a fresh module instance (categoryCache lives at module scope)
const importService = () => {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const service = require("../RssService");
  return {
    fetchArticlesByCategory: service.fetchArticlesByCategory,
    getCachedArticles: service.getCachedArticles,
    validateFeedSource: service.validateFeedSource,
  };
};

const buildResponse = (body: string, ok = true) =>
  ({
    ok,
    status: ok ? 200 : 500,
    text: async () => body,
  }) as Response;

const SAMPLE_FEED = `<?xml version="1.0"?><rss><channel><item><title>A</title><link>https://a</link><description>Body</description><pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate></item></channel></rss>`;
const EMPTY_FEED = `<?xml version="1.0"?><rss><channel></channel></rss>`;
const DISABLED_OVERRIDES = { "Top::Mock Feed": false } as const;

describe("RssService cache and storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reuses cached articles when TTL is valid", async () => {
    const mockFetch = jest.fn().mockResolvedValue(buildResponse(SAMPLE_FEED));
    // @ts-expect-error allow global assignment for test
    global.fetch = mockFetch;

    const { fetchArticlesByCategory } = await importService();

    const first = await fetchArticlesByCategory("Top" as ArticleCategory);
    expect(first).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const second = await fetchArticlesByCategory("Top" as ArticleCategory);
    expect(second).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(1); // cache hit
  });

  it("ignores cache when forceRefresh is true", async () => {
    const mockFetch = jest.fn().mockResolvedValue(buildResponse(SAMPLE_FEED));
    // @ts-expect-error allow global assignment for test
    global.fetch = mockFetch;

    const { fetchArticlesByCategory } = await importService();

    await fetchArticlesByCategory("Top" as ArticleCategory);
    await fetchArticlesByCategory("Top" as ArticleCategory, { forceRefresh: true });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("does not cache empty results", async () => {
    const mockFetch = jest.fn().mockResolvedValue(buildResponse(EMPTY_FEED));
    // @ts-expect-error allow global assignment for test
    global.fetch = mockFetch;

    const { fetchArticlesByCategory } = await importService();

    const first = await fetchArticlesByCategory("Top" as ArticleCategory);
    expect(first).toHaveLength(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const second = await fetchArticlesByCategory("Top" as ArticleCategory);
    expect(second).toHaveLength(0);
    expect(mockFetch).toHaveBeenCalledTimes(2); // refetched because empty not cached
  });

  it("exposes cached articles via getCachedArticles", async () => {
    const mockFetch = jest.fn().mockResolvedValue(buildResponse(SAMPLE_FEED));
    // @ts-expect-error allow global assignment for test
    global.fetch = mockFetch;

    const { fetchArticlesByCategory, getCachedArticles } = await importService();

    await fetchArticlesByCategory("Top" as ArticleCategory);
    const cached = getCachedArticles("Top" as ArticleCategory);

    expect(cached).not.toBeNull();
    expect(cached).toHaveLength(1);
  });

  it("falls back to default-on sources if overrides disable all sources", async () => {
    const mockFetch = jest.fn().mockResolvedValue(buildResponse(SAMPLE_FEED));
    // @ts-expect-error allow global assignment for test
    global.fetch = mockFetch;

    mockLoadSourcePrefs.mockResolvedValueOnce({
      overrides: { ...DISABLED_OVERRIDES },
      customFeeds: [],
    });

    const { fetchArticlesByCategory } = await importService();

    const articles = await fetchArticlesByCategory("Top" as ArticleCategory);

    expect(articles).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("fetches custom feeds alongside default feeds", async () => {
    const mockFetch = jest.fn().mockResolvedValue(buildResponse(SAMPLE_FEED));
    // @ts-expect-error allow global assignment for test
    global.fetch = mockFetch;

    mockLoadSourcePrefs.mockResolvedValueOnce({
      overrides: {},
      customFeeds: [
        {
          id: "custom-1",
          name: "Custom Feed",
          url: "https://custom.example.com/rss",
          category: "Top",
          addedAt: Date.now(),
        },
      ],
    });

    const { fetchArticlesByCategory } = await importService();

    const articles = await fetchArticlesByCategory("Top" as ArticleCategory, {
      forceRefresh: true,
    });

    expect(articles).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe("validateFeedSource", () => {
  const SAMPLE_FEED = `<?xml version="1.0"?><rss><channel><item><title>Ok</title><link>https://a</link><description>Body</description><pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate></item></channel></rss>`;

  it("returns ok for a reachable feed with items", async () => {
    const mockFetch = jest.fn().mockResolvedValue(buildResponse(SAMPLE_FEED));
    // @ts-expect-error allow global assignment for test
    global.fetch = mockFetch;

    const { validateFeedSource } = await importService();
    const result = await validateFeedSource({ url: "https://example.com/rss" });

    expect(result.status).toBe("ok");
    expect(result.itemsFound).toBe(1);
  });

  it("returns unreachable for non-200 responses", async () => {
    const mockFetch = jest.fn().mockResolvedValue(buildResponse(SAMPLE_FEED, false));
    // @ts-expect-error allow global assignment for test
    global.fetch = mockFetch;

    const { validateFeedSource } = await importService();
    const result = await validateFeedSource({ url: "https://example.com/rss" });

    expect(result.status).toBe("unreachable");
  });
});
