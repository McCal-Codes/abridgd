import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCachedFullStory, fetchAndCacheFullStory, clearExpiredFullStories } from "../fullStoryCache";
import { fetchFullArticleBody } from "../FullStoryService";

jest.mock("../FullStoryService", () => ({
  fetchFullArticleBody: jest.fn(),
}));

const URL = "https://example.com/article";
const KEY_PREFIX = "abridged:fullStoryCache:v1:";

describe("fullStoryCache", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it("caches a successful fetch and serves it on the next call without refetching", async () => {
    (fetchFullArticleBody as jest.Mock).mockResolvedValue("<p>Full story</p>");

    const first = await fetchAndCacheFullStory(URL);
    expect(first).toBe("<p>Full story</p>");
    expect(fetchFullArticleBody).toHaveBeenCalledTimes(1);

    const second = await fetchAndCacheFullStory(URL);
    expect(second).toBe("<p>Full story</p>");
    expect(fetchFullArticleBody).toHaveBeenCalledTimes(1); // served from cache
  });

  it("does not cache a null result", async () => {
    (fetchFullArticleBody as jest.Mock).mockResolvedValue(null);

    const first = await fetchAndCacheFullStory(URL);
    expect(first).toBeNull();

    const second = await fetchAndCacheFullStory(URL);
    expect(second).toBeNull();
    expect(fetchFullArticleBody).toHaveBeenCalledTimes(2); // no cache entry written, so it retries
  });

  it("expires a cache entry older than the TTL on read", async () => {
    (fetchFullArticleBody as jest.Mock).mockResolvedValue("<p>Old content</p>");
    await fetchAndCacheFullStory(URL);

    const realNow = Date.now;
    Date.now = () => realNow() + 25 * 60 * 60 * 1000; // 25h later, past the 24h TTL
    try {
      const cached = await getCachedFullStory(URL);
      expect(cached).toBeNull();
    } finally {
      Date.now = realNow;
    }
  });

  it("dedupes concurrent fetches for the same URL", async () => {
    let resolveFetch: (value: string) => void = () => {};
    (fetchFullArticleBody as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const p1 = fetchAndCacheFullStory(URL);
    const p2 = fetchAndCacheFullStory(URL);

    // fetchAndCacheFullStory awaits an AsyncStorage cache read before it ever reaches the
    // network call, so wait for the mock to actually be invoked before resolving it —
    // resolving too early would resolve nothing and hang the test forever.
    for (let i = 0; i < 50 && (fetchFullArticleBody as jest.Mock).mock.calls.length === 0; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    resolveFetch("<p>Deduped content</p>");

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe("<p>Deduped content</p>");
    expect(r2).toBe("<p>Deduped content</p>");
    expect(fetchFullArticleBody).toHaveBeenCalledTimes(1);
  });

  it("clearExpiredFullStories removes only entries past the TTL", async () => {
    (fetchFullArticleBody as jest.Mock).mockResolvedValue("<p>Content</p>");
    await fetchAndCacheFullStory(URL);

    const keysBefore = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(KEY_PREFIX));
    expect(keysBefore).toHaveLength(1);

    const realNow = Date.now;
    Date.now = () => realNow() + 25 * 60 * 60 * 1000;
    try {
      await clearExpiredFullStories();
    } finally {
      Date.now = realNow;
    }

    const keysAfter = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(KEY_PREFIX));
    expect(keysAfter).toHaveLength(0);
  });
});
