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
    const xml = `<?xml version="1.0"?><feed><entry><title>Atom Entry</title><id>tag:example.com,2026:1</id><link rel="alternate" href="https://example.com/post"/><link rel="self" href="https://example.com/feed"/><summary>Atom summary text</summary><updated>2026-01-01T00:00:00Z</updated><content>Body text</content></entry></feed>`;
    const result = parseFeedXml(xml);
    expect(result).not.toBeNull();
    expect(result?.isAtom).toBe(true);
    expect(result?.items).toHaveLength(1);

    const article = normalizeFeedItem(result!.items[0], "Top", "Atom Source", provenance);
    expect(article.headline).toBe("Atom Entry");
    expect(article.id).toBe("Atom Source::tag:example.com,2026:1");
    expect(article.body).toBe("Body text");
    // Atom's link is an attribute node, not text. Returning the object made
    // article.link unusable downstream; the rel="alternate" href is the article URL.
    expect(article.link).toBe("https://example.com/post");
    // Atom has no <description>, so without reading <summary> the card summarised
    // itself with its own headline.
    expect(article.summary).toBe("Atom summary text");
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

  // Undated items must sort last, never first. Date.now() was the previous fallback,
  // which stacked a whole source above every genuinely-dated article and persisted it.
  it("sorts undated items last rather than pinning them to the top", () => {
    const item = { title: "No date", link: "https://a", description: "desc" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.publishedAt).toBe(0);
    expect(article.timestamp).toBe("Recently");
  });

  it("sorts unparseable dates last, and never produces NaN", () => {
    const item = { title: "Bad date", link: "https://a", description: "desc", pubDate: "not-a-date" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(Number.isNaN(article.publishedAt)).toBe(false);
    expect(article.publishedAt).toBe(0);
    expect(article.timestamp).toBe("Recently");
  });

  // RFC-822 with an alphabetic zone is what RSS actually mandates, and it is
  // implementation-defined in JS - Hermes parses a narrower set than V8.
  it("parses RFC-822 dates with alphabetic timezones", () => {
    const item = { title: "Zoned", link: "https://a", description: "d", pubDate: "Wed, 02 Oct 2002 13:00:00 EST" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.publishedAt).toBe(Date.UTC(2002, 9, 2, 18, 0, 0));
  });

  it("reads dc:date, the RSS 1.0 date element", () => {
    const item = { title: "RDF", link: "https://a", description: "d", "dc:date": "2026-03-04T05:06:07Z" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.publishedAt).toBe(Date.parse("2026-03-04T05:06:07Z"));
  });

  it("derives a stable ID from link when guid/id are absent", () => {
    const item = { title: "Linked", link: "https://stable-link", description: "desc" };
    const article = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(article.id).toBe("Source::https://stable-link");
  });

  // Previously Math.random(), which minted a new id every parse and silently detached
  // saved state and reading progress on refresh.
  it("derives a deterministic ID from the headline when guid, id and link are absent", () => {
    const item = { title: "No identifiers", description: "desc" };
    const first = normalizeFeedItem(item, "Top", "Source", provenance);
    const second = normalizeFeedItem(item, "Top", "Source", provenance);
    expect(first.id).toBe(second.id);
    expect(first.id).toBe("Source::No identifiers");
  });

  // Integer guids are common on WordPress, so raw guids collide across publishers.
  it("namespaces IDs by source so guids cannot collide across publishers", () => {
    const item = { title: "Shared", link: "https://a", guid: "12345", description: "d" };
    const a = normalizeFeedItem(item, "Top", "Outlet A", provenance);
    const b = normalizeFeedItem(item, "Top", "Outlet B", provenance);
    expect(a.id).not.toBe(b.id);
  });

  // RN's URL polyfill concatenates rather than resolving, so these are handled explicitly.
  describe("image URL resolution", () => {
    it("resolves root-relative image URLs against the article link", () => {
      const item = {
        title: "Rel",
        link: "https://news.example.com/2026/03/story",
        description: '<img src="/wp-content/photo.jpg">',
      };
      const article = normalizeFeedItem(item, "Top", "Source", provenance);
      expect(article.imageUrl).toBe("https://news.example.com/wp-content/photo.jpg");
    });

    it("resolves protocol-relative image URLs to https", () => {
      const item = {
        title: "Proto",
        link: "https://news.example.com/a",
        description: '<img src="//img.example.com/photo.jpg">',
      };
      const article = normalizeFeedItem(item, "Top", "Source", provenance);
      expect(article.imageUrl).toBe("https://img.example.com/photo.jpg");
    });

    it("upgrades http image URLs to https", () => {
      const item = {
        title: "Insecure",
        link: "https://news.example.com/a",
        enclosure: { "@_url": "http://img.example.com/photo.jpg", "@_type": "image/jpeg" },
      };
      const article = normalizeFeedItem(item, "Top", "Source", provenance);
      expect(article.imageUrl).toBe("https://img.example.com/photo.jpg");
    });

    it("drops tracking beacons from every extraction path", () => {
      const item = {
        title: "Beacon",
        link: "https://news.example.com/a",
        enclosure: { "@_url": "https://feeds.feedburner.com/~ff/beacon.gif", "@_type": "image/gif" },
        description: '<figure><img src="https://example.com/pixel.gif"></figure>',
      };
      const article = normalizeFeedItem(item, "Top", "Source", provenance);
      expect(article.imageUrl).toBeUndefined();
      expect(article.mediaImages).toHaveLength(0);
    });

    it("reads media:thumbnail, the only image some Arc feeds carry", () => {
      const item = {
        title: "Arc",
        link: "https://wpxi.com/a",
        "media:thumbnail": { "@_url": "https://wpxi.com/img/hero.jpg", "@_width": "800" },
      };
      const article = normalizeFeedItem(item, "Top", "Source", provenance);
      expect(article.imageUrl).toBe("https://wpxi.com/img/hero.jpg");
    });
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
    expect(article.id).toBe("Source::guid-1");
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
