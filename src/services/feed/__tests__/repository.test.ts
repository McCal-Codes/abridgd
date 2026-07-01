import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ArticleCategory } from "../../../types/Article";

const mockFetchFeedXml = jest.fn();
const mockFetchViaRss2Json: jest.Mock = jest.fn(async () => null);

jest.mock("../transport", () => ({
  fetchFeedXml: (...args: unknown[]) => mockFetchFeedXml(...args),
  fetchViaRss2Json: (...args: unknown[]) => mockFetchViaRss2Json(...args),
}));

const mockLoadSourcePrefs = jest.fn(async () => ({ overrides: {}, customFeeds: [] }));
jest.mock("../../../utils/sourcePreferences", () => ({
  loadSourcePreferences: () => mockLoadSourcePrefs(),
  isSourceEnabled: (
    overrides: Record<string, boolean>,
    category: string,
    name: string,
    defaultEnabled: boolean,
  ) => {
    const key = `${category}::${name}`;
    return overrides[key] === undefined ? defaultEnabled : overrides[key];
  },
}));

jest.mock("../../../data/feedConfig", () => ({
  RSS_FEEDS: {
    Top: [{ name: "Source A", url: "https://a.example.com/rss" }],
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fetchCategory, getCachedCategory } = require("../repository");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __resetForTests } = require("../cacheStore");

const buildResponse = (body: string, ok = true) =>
  ({ ok, status: ok ? 200 : 500, text: async () => body }) as Response;

const SAMPLE_FEED = `<?xml version="1.0"?><rss><channel><item><title>A</title><link>https://a</link><description>Body</description><pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate></item></channel></rss>`;

describe("feed repository", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockLoadSourcePrefs.mockResolvedValue({ overrides: {}, customFeeds: [] });
    mockFetchViaRss2Json.mockResolvedValue(null);
    await AsyncStorage.clear();
    __resetForTests();
  });

  it("writes a per-source cache snapshot on success", async () => {
    mockFetchFeedXml.mockResolvedValue({ response: buildResponse(SAMPLE_FEED), error: null });

    const result = await fetchCategory("Top" as ArticleCategory);
    expect(result.articles).toHaveLength(1);

    const cached = getCachedCategory("Top" as ArticleCategory);
    expect(cached?.articles).toHaveLength(1);
  });

  it("preserves a stale snapshot instead of blanking it when a later fetch fails", async () => {
    mockFetchFeedXml.mockResolvedValue({ response: buildResponse(SAMPLE_FEED), error: null });
    const first = await fetchCategory("Top" as ArticleCategory);
    expect(first.articles).toHaveLength(1);

    mockFetchFeedXml.mockResolvedValue({ response: null, error: new Error("network down") });

    const second = await fetchCategory("Top" as ArticleCategory, { forceRefresh: true });
    expect(second.articles).toHaveLength(1); // stale snapshot preserved, not blanked
  });

  it("throws only when no source has ever succeeded and the live attempt also fails", async () => {
    mockFetchFeedXml.mockResolvedValue({ response: null, error: new Error("network down") });

    await expect(fetchCategory("Top" as ArticleCategory)).rejects.toMatchObject({
      name: "FeedLoadError",
    });
  });

  it("does not throw when a source legitimately returns zero items (no failure recorded)", async () => {
    const EMPTY_FEED = `<?xml version="1.0"?><rss><channel></channel></rss>`;
    mockFetchFeedXml.mockResolvedValue({ response: buildResponse(EMPTY_FEED), error: null });

    const result = await fetchCategory("Top" as ArticleCategory);
    expect(result.articles).toHaveLength(0);
  });

  it("dedupes concurrent fetches for the same source", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    mockFetchFeedXml.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const p1 = fetchCategory("Top" as ArticleCategory);
    const p2 = fetchCategory("Top" as ArticleCategory);

    // fetchCategory awaits cache hydration (AsyncStorage) before it ever reaches the
    // network call, so wait for the mock to actually be invoked before resolving it —
    // resolving too early would resolve nothing and hang the test forever.
    for (let i = 0; i < 50 && mockFetchFeedXml.mock.calls.length === 0; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    resolveFetch({ response: buildResponse(SAMPLE_FEED), error: null });

    await Promise.all([p1, p2]);
    expect(mockFetchFeedXml).toHaveBeenCalledTimes(1);
  });

  it("serves cache with no network call within the soft TTL", async () => {
    mockFetchFeedXml.mockResolvedValue({ response: buildResponse(SAMPLE_FEED), error: null });

    await fetchCategory("Top" as ArticleCategory);
    expect(mockFetchFeedXml).toHaveBeenCalledTimes(1);

    await fetchCategory("Top" as ArticleCategory);
    expect(mockFetchFeedXml).toHaveBeenCalledTimes(1); // still within soft TTL, no second call
  });

  it("bypasses the soft TTL and refetches when forceRefresh is set", async () => {
    mockFetchFeedXml.mockResolvedValue({ response: buildResponse(SAMPLE_FEED), error: null });

    await fetchCategory("Top" as ArticleCategory);
    await fetchCategory("Top" as ArticleCategory, { forceRefresh: true });

    expect(mockFetchFeedXml).toHaveBeenCalledTimes(2);
  });
});
