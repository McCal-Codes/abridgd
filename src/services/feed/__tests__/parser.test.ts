import { parseFeedXml, normalizeFeedItem } from "../parser";
import { normalizeRss2JsonItem } from "../transport";

const provenance = { sourceDomain: "example.com", sourceLastRefreshedAt: null };

describe("parseFeedXml", () => {
  it("parses RSS 2.0 channel.item feeds", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>A</title><link>https://a</link></item></channel></rss>`;
    const result = parseFeedXml(xml);
    expect(result).not.toBeNull();
    expect(result?.isAtom).toBe(false);
    expect(result?.items).toHaveLength(1);
  });

  it("parses Atom feed.entry feeds", () => {
    const xml = `<?xml version="1.0"?><feed><entry><title>Atom Entry</title><id>tag:example.com,2026:1</id><updated>2026-01-01T00:00:00Z</updated><content>Body text</content></entry></feed>`;
    const result = parseFeedXml(xml);
    expect(result).not.toBeNull();
    expect(result?.isAtom).toBe(true);
    expect(result?.items).toHaveLength(1);

    const article = normalizeFeedItem(result!.items[0], "Top", "Atom Source", provenance);
    expect(article.headline).toBe("Atom Entry");
    expect(article.id).toBe("tag:example.com,2026:1");
    expect(article.body).toBe("Body text");
  });

  it("returns null for a response with no readable channel or feed", () => {
    const html = `<!DOCTYPE html><html><body>Not a feed</body></html>`;
    expect(parseFeedXml(html)).toBeNull();
  });

  it("handles single-item feeds where item is not an array", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>Solo</title><link>https://solo</link></item></channel></rss>`;
    const result = parseFeedXml(xml);
    expect(result?.items).toHaveLength(1);
    expect(result?.items[0].title).toBe("Solo");
  });
});

describe("normalizeFeedItem", () => {
  it("extracts media namespace images from a single media:content object", () => {
    const item = {
      title: "Single media",
      link: "https://a",
      description: "desc",
      "media:content": { "@_url": "https://img/one.jpg", "@_type": "image/jpeg" },
    };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.imageUrl).toBe("https://img/one.jpg");
    expect(article.mediaImages).toContain("https://img/one.jpg");
  });

  it("extracts media namespace images/videos from an array of media:content", () => {
    const item = {
      title: "Array media",
      link: "https://a",
      description: "desc",
      "media:content": [
        { "@_url": "https://img/two.jpg", "@_type": "image/jpeg" },
        { "@_url": "https://vid/clip.mp4", "@_type": "video/mp4" },
      ],
    };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.mediaImages).toContain("https://img/two.jpg");
    expect(article.mediaVideos).toContain("https://vid/clip.mp4");
  });

  it("falls back to itunes:image when no enclosure or media:content image exists", () => {
    const item = {
      title: "Podcast item",
      link: "https://a",
      description: "desc",
      "itunes:image": { "@_href": "https://img/cover.jpg" },
    };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.imageUrl).toBe("https://img/cover.jpg");
  });

  it("classifies an enclosure video by its @_type prefix", () => {
    const item = {
      title: "Video item",
      link: "https://a",
      description: "desc",
      enclosure: { "@_url": "https://vid/a.mp4", "@_type": "video/mp4" },
    };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.mediaVideos).toContain("https://vid/a.mp4");
    expect(article.imageUrl).toBeUndefined();
  });

  it("degrades gracefully on malformed HTML in the body without throwing", () => {
    const item = {
      title: "Malformed",
      link: "https://a",
      description: "<p>Unclosed paragraph <b>bold text",
      "content:encoded": "<div>stray < bracket and <p>partial",
    };
    expect(() => normalizeFeedItem(item, "Top", "Source", provenance)).not.toThrow();
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(typeof article.body).toBe("string");
  });

  it("falls back to Date.now() when pubDate is missing", () => {
    const before = Date.now();
    const item = { title: "No date", link: "https://a", description: "desc" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.publishedAt).toBeGreaterThanOrEqual(before);
    expect(article.timestamp).toBe("Recently");
  });

  it("falls back to Date.now() when pubDate is unparseable, instead of NaN", () => {
    const item = { title: "Bad date", link: "https://a", description: "desc", pubDate: "not-a-date" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(Number.isNaN(article.publishedAt)).toBe(false);
    expect(article.timestamp).toBe("Recently");
  });

  it("derives a stable ID from link when guid/id are absent", () => {
    const item = { title: "Linked", link: "https://stable-link", description: "desc" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.id).toBe("https://stable-link");
  });

  it("falls back to a random ID only when guid, id, and link are all absent", () => {
    const item = { title: "No identifiers", description: "desc" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.id).toBeTruthy();
  });

  it("extracts author from dc:creator", () => {
    const item = { title: "A", link: "https://a", description: "desc", "dc:creator": "Jane Doe" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.author).toBe("Jane Doe");
  });

  it("extracts author from an RSS 2.0 'email (Name)' author field, preferring the name", () => {
    const item = {
      title: "A",
      link: "https://a",
      description: "desc",
      author: "jane@example.com (Jane Doe)",
    };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.author).toBe("Jane Doe");
  });

  it("extracts author from an Atom <author><name> object", () => {
    const item = {
      title: "A",
      link: "https://a",
      description: "desc",
      author: { name: "Jane Doe" },
    };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.author).toBe("Jane Doe");
  });

  it("strips a leading 'By ' prefix from the author field", () => {
    const item = { title: "A", link: "https://a", description: "desc", "dc:creator": "By Jane Doe" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.author).toBe("Jane Doe");
  });

  it("does not surface a bare email address with no parenthesized name as an author", () => {
    const item = { title: "A", link: "https://a", description: "desc", author: "newsroom@example.com" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.author).toBeUndefined();
  });

  it("leaves author undefined when no author field is present", () => {
    const item = { title: "A", link: "https://a", description: "desc" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.author).toBeUndefined();
  });

  it("prefers the media:content image with the largest declared width over enclosure", () => {
    const item = {
      title: "A",
      link: "https://a",
      description: "desc",
      enclosure: { "@_url": "https://img/thumb.jpg", "@_type": "image/jpeg" },
      "media:content": { "@_url": "https://img/full.jpg", "@_type": "image/jpeg", "@_width": "1200" },
    };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.imageUrl).toBe("https://img/full.jpg");
  });

  it("falls back to source-priority (media:content over enclosure) when no width is declared", () => {
    const item = {
      title: "A",
      link: "https://a",
      description: "desc",
      enclosure: { "@_url": "https://img/thumb.jpg", "@_type": "image/jpeg" },
      "media:content": { "@_url": "https://img/full.jpg", "@_type": "image/jpeg" },
    };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.imageUrl).toBe("https://img/full.jpg");
  });

  it("truncates a long summary at a word boundary instead of mid-word", () => {
    const longSummary = "word ".repeat(40).trim(); // well over 150 chars, all short words
    const item = { title: "A", link: "https://a", description: longSummary };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.summary.length).toBeLessThanOrEqual(151);
    expect(article.summary.endsWith("…")).toBe(true);
    expect(article.summary.slice(0, -1).trim().endsWith("word")).toBe(true);
  });

  it("populates provenance with the passed-in source domain and refresh timestamp", () => {
    const item = { title: "Provenance test", link: "https://a", description: "desc" };
    const article = normalizeFeedItem(item, "Local", "Kidsburgh", {
      sourceDomain: "kidsburgh.org",
      sourceLastRefreshedAt: 1234567890,
    });
    expect(article.provenance).toEqual({
      sourceName: "Kidsburgh",
      sourceDomain: "kidsburgh.org",
      category: "Local",
      publishedAt: article.publishedAt,
      inclusionReason: "Included because Kidsburgh is an enabled source in your Local feed.",
      sourceLastRefreshedAt: 1234567890,
    });
  });
});

describe("normalizeRss2JsonItem", () => {
  it("normalizes an rss2json item into the RawFeedItem shape parser.ts expects", () => {
    const raw = normalizeRss2JsonItem({
      title: "From rss2json",
      description: "desc",
      link: "https://a",
      pubDate: "2026-01-01T00:00:00Z",
      guid: "guid-1",
      enclosure: { link: "https://img/enc.jpg", type: "image/jpeg" },
    });

    const article = normalizeFeedItem(raw, "Top", "Source", provenance);
    expect(article.headline).toBe("From rss2json");
    expect(article.id).toBe("guid-1");
    expect(article.imageUrl).toBe("https://img/enc.jpg");
  });
});

describe("normalizeFeedItem image caption and credit", () => {
  const provenance = { sourceDomain: "example.com", sourceLastRefreshedAt: null };

  it("reads caption and credit off the chosen media:content entry", () => {
    const article = normalizeFeedItem(
      {
        title: "Story",
        "media:content": {
          "@_url": "https://x.test/hero.jpg",
          "@_width": "1200",
          "media:description": "Fans gather on the North Shore.",
          "media:credit": "AP Photo/Gene J. Puskar",
        },
      } as never,
      "Top",
      "Example",
      provenance,
    );

    expect(article.imageCaption).toBe("Fans gather on the North Shore.");
    expect(article.imageCredit).toBe("AP Photo/Gene J. Puskar");
  });

  it("falls back to item-level media metadata and splits an inline credit", () => {
    const article = normalizeFeedItem(
      {
        title: "Story",
        enclosure: { "@_url": "https://x.test/hero.jpg" },
        "media:description": "The bridge at dusk (Photo: Jane Doe)",
      } as never,
      "Top",
      "Example",
      provenance,
    );

    expect(article.imageCaption).toBe("The bridge at dusk");
    expect(article.imageCredit).toBe("Photo: Jane Doe");
  });

  it("leaves caption and credit undefined when the feed carries no media metadata", () => {
    const article = normalizeFeedItem(
      { title: "Story", enclosure: { "@_url": "https://x.test/hero.jpg" } } as never,
      "Top",
      "Example",
      provenance,
    );

    expect(article.imageCaption).toBeUndefined();
    expect(article.imageCredit).toBeUndefined();
  });
});
