import { RSS_FEEDS } from "../feedConfig";
import type { ArticleCategory } from "../../types/Article";

const categories = Object.keys(RSS_FEEDS) as ArticleCategory[];

describe("feedConfig", () => {
  it.each(categories)("%s sources all have well-formed https URLs", (category) => {
    RSS_FEEDS[category].forEach((source) => {
      expect(() => new URL(source.url)).not.toThrow();
      // Every source, not just the enabled ones: a disabled entry is a candidate for
      // re-enabling, and an http:// URL would be blocked by ATS the moment it was.
      expect(source.url.startsWith("https://")).toBe(true);
    });
  });

  it.each(categories)("%s source names are unique", (category) => {
    const names = RSS_FEEDS[category].map((source) => source.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(categories)("%s keeps every pending-replacement source disabled", (category) => {
    RSS_FEEDS[category]
      .filter((source) => source.health === "pending-replacement")
      .forEach((source) => {
        expect(source.defaultEnabled).toBe(false);
        // A broken source without a dated note is unactionable six months later.
        expect(source.healthNote).toMatch(/^\d{4}-\d{2}-\d{2}:/);
      });
  });

  it.each(categories)("%s has at least two enabled sources", (category) => {
    const enabled = RSS_FEEDS[category].filter((source) => source.defaultEnabled !== false);
    expect(enabled.length).toBeGreaterThanOrEqual(2);
  });
});
