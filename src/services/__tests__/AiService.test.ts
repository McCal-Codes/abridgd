import AsyncStorage from "@react-native-async-storage/async-storage";
import { Article } from "../../types/Article";
import { fetchArticlesByCategory } from "../RssService";
import { fetchDailyDigest, summarizeArticle } from "../AiService";

jest.mock("@react-native-async-storage/async-storage");
jest.mock("../RssService", () => ({
  fetchArticlesByCategory: jest.fn(),
}));

const mockFetchArticlesByCategory = fetchArticlesByCategory as jest.MockedFunction<
  typeof fetchArticlesByCategory
>;

const buildArticle = (overrides: Partial<Article>): Article => ({
  id: "article-1",
  headline: "Headline",
  summary: "First sentence. Second sentence.",
  body: "<p>First sentence.</p><p>Second sentence.</p>",
  source: "Source",
  timestamp: "Mar 22, 2026",
  publishedAt: Date.now(),
  category: "Top",
  readTimeMinutes: 3,
  ...overrides,
});

describe("AiService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    mockFetchArticlesByCategory.mockImplementation(async (category) => {
      if (category === "Top") {
        return [
          buildArticle({
            id: "top-older",
            headline: "Older",
            publishedAt: Date.now() - 10 * 60 * 60 * 1000,
          }),
          buildArticle({
            id: "top-newer",
            headline: "Newer",
            publishedAt: Date.now() - 5 * 60 * 60 * 1000,
          }),
        ];
      }

      return [];
    });
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("builds the digest from live feed data instead of mock articles", async () => {
    const digest = await fetchDailyDigest(null, "fact-based");

    expect(mockFetchArticlesByCategory).toHaveBeenCalled();
    expect(digest).toHaveLength(2);
    expect(digest[0].article.id).toBe("top-newer");
    expect(digest[1].article.id).toBe("top-older");
  });

  it("falls back to extractive digest summaries when no API key is stored", async () => {
    mockFetchArticlesByCategory.mockImplementation(async (category) => {
      if (category === "Top") {
        return [
          buildArticle({
            id: "top-recent",
            summary: "Lead summary sentence. Supporting detail sentence.",
            publishedAt: Date.now() - 5 * 60 * 1000,
          }),
        ];
      }

      return [];
    });

    const digest = await fetchDailyDigest(Date.now() - 60 * 60 * 1000, "ai-summary");

    expect(global.fetch).not.toHaveBeenCalled();
    expect(digest[0].summary).toBe("Lead summary sentence.");
  });

  it("uses the saved Perplexity key for article summaries", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("pplx-secret");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "A concise AI summary.",
            },
          },
        ],
      }),
    });

    const summary = await summarizeArticle(
      "<p>Long article content.</p><p>More context for the summary.</p>",
      "Saved key headline",
    );

    expect(AsyncStorage.getItem).toHaveBeenCalledWith("perplexityApiKey");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(summary).toBe("A concise AI summary.");
  });

  it("excludes articles already fetched by the active profile when building the digest", async () => {
    mockFetchArticlesByCategory.mockImplementation(async (category) => {
      if (category === "Top") {
        return [
          buildArticle({
            id: "top-seen",
            headline: "Seen Story",
            publishedAt: Date.now() - 30 * 60 * 1000,
          }),
          buildArticle({
            id: "top-fresh",
            headline: "Fresh Story",
            publishedAt: Date.now() - 20 * 60 * 1000,
          }),
        ];
      }

      return [];
    });

    const digest = await fetchDailyDigest(null, "fact-based", {
      excludeArticleIds: ["top-seen"],
      lastFetchedAt: Date.now() - 60 * 60 * 1000,
    });

    expect(digest).toHaveLength(1);
    expect(digest[0].article.id).toBe("top-fresh");
  });
});
