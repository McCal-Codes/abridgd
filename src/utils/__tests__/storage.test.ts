import {
  serializeArticles,
  deserializeArticles,
  saveArticlesToStorage,
  loadArticlesFromStorage,
  isMigrationComplete,
  markMigrationComplete,
  clearSavedArticles,
} from "../storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Article } from "../../types/Article";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage");

const mockArticle: Article = {
  id: "test-1",
  headline: "Test Article",
  summary: "This is a test summary",
  body: "This is a test body with some content",
  source: "Test Source",
  timestamp: "2024-01-19T00:00:00Z",
  publishedAt: 1705603200000,
  category: "Top",
  imageUrl: "https://example.com/image.jpg",
  readTimeMinutes: 5,
  link: "https://example.com/article",
  tags: ["test", "mock"],
};

describe("Storage Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("serializeArticles", () => {
    it("should serialize articles with schema version and timestamp", () => {
      const articles = [mockArticle];
      const serialized = serializeArticles(articles);
      const parsed = JSON.parse(serialized);

      expect(parsed.version).toBe(2);
      expect(parsed.compressed).toBe(false);
      expect(parsed.payload).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
      expect(typeof parsed.timestamp).toBe("number");
    });

    it("should handle empty array", () => {
      const serialized = serializeArticles([]);
      const parsed = JSON.parse(serialized);

      expect(parsed.version).toBe(2);
      expect(parsed.compressed).toBe(false);
      expect(JSON.parse(parsed.payload).articles).toEqual([]);
    });

    it("should handle multiple articles", () => {
      const articles = [mockArticle, { ...mockArticle, id: "test-2" }];
      const serialized = serializeArticles(articles);
      const parsed = JSON.parse(serialized);

      expect(JSON.parse(parsed.payload).articles).toHaveLength(2);
    });

    it("should compress large payloads", () => {
      const longBody = "x".repeat(5000);
      const articles = [{ ...mockArticle, id: "long", body: longBody }];
      const serialized = serializeArticles(articles);
      const parsed = JSON.parse(serialized);

      expect(parsed.compressed).toBe(true);
      // payload should not equal raw JSON when compressed
      expect(parsed.payload).not.toContain(longBody);
      // decompression yields original articles
      const decompressedPayload = JSON.parse(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("lz-string").decompressFromUTF16(parsed.payload),
      );
      expect(decompressedPayload.articles[0].body).toBe(longBody);
    });
  });

  describe("deserializeArticles", () => {
    it("should deserialize valid articles", () => {
      const articles = [mockArticle];
      const serialized = serializeArticles(articles);
      const deserialized = deserializeArticles(serialized);

      expect(deserialized).toEqual(articles);
    });

    it("should return empty array for invalid JSON", () => {
      const deserialized = deserializeArticles("invalid json");
      expect(deserialized).toEqual([]);
    });

    it("should return empty array for mismatched schema version", () => {
      const schema = { version: 999, payload: "{}", timestamp: Date.now() };
      const serialized = JSON.stringify(schema);
      const deserialized = deserializeArticles(serialized);

      expect(deserialized).toEqual([]);
    });

    it("should handle missing articles field", () => {
      const schema = { version: 1, timestamp: Date.now() };
      const serialized = JSON.stringify(schema);
      const deserialized = deserializeArticles(serialized);

      expect(deserialized).toEqual([]);
    });

    it("should handle legacy version 1 payloads", () => {
      const schema = {
        version: 1,
        articles: [mockArticle],
        timestamp: Date.now(),
      };
      const serialized = JSON.stringify(schema);
      const deserialized = deserializeArticles(serialized);

      expect(deserialized).toEqual([mockArticle]);
    });
  });

  describe("saveArticlesToStorage", () => {
    it("should save articles to AsyncStorage", async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      const articles = [mockArticle];

      await saveArticlesToStorage(articles);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@abridged_saved_articles",
        expect.stringContaining('"version":2'),
      );
    });

    it("should retry on failure with exponential backoff", async () => {
      (AsyncStorage.setItem as jest.Mock)
        .mockRejectedValueOnce(new Error("First fail"))
        .mockRejectedValueOnce(new Error("Second fail"))
        .mockResolvedValueOnce(undefined);

      const articles = [mockArticle];
      const startTime = Date.now();

      await saveArticlesToStorage(articles, 3, 10);

      const duration = Date.now() - startTime;
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
      // Should have waited roughly 10 + 20 = 30ms due to exponential backoff
      expect(duration).toBeGreaterThanOrEqual(25);
    });

    it("should throw error after max retries", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error("Persistent failure"));

      const articles = [mockArticle];

      await expect(saveArticlesToStorage(articles, 2, 10)).rejects.toThrow(
        "Failed to save articles after 2 attempts",
      );
    });
  });

  describe("loadArticlesFromStorage", () => {
    it("should load articles from AsyncStorage", async () => {
      const articles = [mockArticle];
      const serialized = serializeArticles(articles);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serialized);

      const loaded = await loadArticlesFromStorage();

      expect(loaded).toEqual(articles);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@abridged_saved_articles");
    });

    it("should return empty array when storage is empty", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const loaded = await loadArticlesFromStorage();

      expect(loaded).toEqual([]);
    });

    it("should retry on failure with exponential backoff", async () => {
      const articles = [mockArticle];
      const serialized = serializeArticles(articles);

      (AsyncStorage.getItem as jest.Mock)
        .mockRejectedValueOnce(new Error("First fail"))
        .mockResolvedValueOnce(serialized);

      const loaded = await loadArticlesFromStorage(3, 10);

      expect(loaded).toEqual(articles);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(2);
    });

    it("should return empty array after max retries", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error("Persistent failure"));

      const loaded = await loadArticlesFromStorage(2, 10);

      expect(loaded).toEqual([]);
    });
  });

  describe("isMigrationComplete", () => {
    it("should return true if migration flag is set", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("true");

      const result = await isMigrationComplete();

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@abridged_migration_complete");
    });

    it("should return false if migration flag is not set", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await isMigrationComplete();

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error("Storage error"));

      const result = await isMigrationComplete();

      expect(result).toBe(false);
    });

    it("should scope migration flag per storage key when provided", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("true");

      const result = await isMigrationComplete("@abridged_saved_articles_profileA");

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        "@abridged_migration_complete:@abridged_saved_articles_profileA",
      );
    });
  });

  describe("markMigrationComplete", () => {
    it("should set migration flag", async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await markMigrationComplete();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith("@abridged_migration_complete", "true");
    });

    it("should scope migration flag per storage key when provided", async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await markMigrationComplete("@abridged_saved_articles_profileA");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@abridged_migration_complete:@abridged_saved_articles_profileA",
        "true",
      );
    });

    it("should handle errors gracefully", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error("Storage error"));

      // Should not throw
      await expect(markMigrationComplete()).resolves.toBeUndefined();
    });
  });

  describe("clearSavedArticles", () => {
    it("should remove saved articles from storage", async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await clearSavedArticles();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@abridged_saved_articles");
    });

    it("should throw error on failure", async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error("Storage error"));

      await expect(clearSavedArticles()).rejects.toThrow("Storage error");
    });
  });
});
