import { extractWordPressSlug, getHostname, hostMatchesDomain } from "../FullStoryService";

describe("FullStoryService URL helpers", () => {
  it("extracts the hostname of an http(s) URL", () => {
    expect(getHostname("https://www.TribLive.com/news/story/")).toBe("www.triblive.com");
    expect(getHostname("http://wesa.fm:8080/x")).toBe("wesa.fm");
    expect(getHostname("ftp://triblive.com/x")).toBeNull();
    expect(getHostname("not a url")).toBeNull();
  });

  it("matches a domain and its subdomains only", () => {
    expect(hostMatchesDomain("https://triblive.com/a", "triblive.com")).toBe(true);
    expect(hostMatchesDomain("https://www.triblive.com/a", "triblive.com")).toBe(true);
  });

  it("does not match a domain that merely appears elsewhere in the URL", () => {
    expect(hostMatchesDomain("https://evil.example/?u=triblive.com", "triblive.com")).toBe(false);
    expect(hostMatchesDomain("https://nottriblive.com/a", "triblive.com")).toBe(false);
    expect(hostMatchesDomain("https://triblive.com.evil.example/a", "triblive.com")).toBe(false);
  });

  it("extracts a plain WordPress slug and rejects anything else", () => {
    expect(extractWordPressSlug("https://triblive.com/local/cleanup-continues/")).toBe(
      "cleanup-continues",
    );
    expect(extractWordPressSlug("https://triblive.com/local/cleanup-continues/?utm=1#top")).toBe(
      "cleanup-continues",
    );
    expect(extractWordPressSlug("https://triblive.com/a/b%26evil=1")).toBeNull();
    expect(extractWordPressSlug("https://triblive.com/")).toBeNull();
  });
});

describe("fetchFullArticleBody (extraction and metadata)", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { fetchFullArticleBody } = require("../FullStoryService");
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  const serve = (html: string) => {
    global.fetch = jest.fn(async () => ({ ok: true, status: 200, text: async () => html, json: async () => [] })) as any;
  };
  const prose = `<p>${"A long paragraph of reporting about what happened downtown today. ".repeat(6)}</p>`;

  it("returns the story, the byline and the lead photo from a page the selector list has never seen", async () => {
    serve(`<html><head>
      <meta property="og:image" content="https://cdn.example.com/lead.jpg">
      <script type="application/ld+json">{"@type":"NewsArticle","author":{"name":"Jane Reporter"}}</script>
      </head><body><nav><p>Menu</p></nav><section>${prose}${prose}</section></body></html>`);

    const result = await fetchFullArticleBody("https://unknown-site.example/story");

    expect(result.body).toContain("downtown today");
    expect(result.author).toBe("Jane Reporter");
    expect(result.imageUrl).toBe("https://cdn.example.com/lead.jpg");
  });

  it("returns just a photo and byline when the page has no extractable story (paywalled)", async () => {
    serve(`<html><head><meta property="og:image" content="https://cdn.example.com/lead.jpg"></head>
      <body><p>Subscribe to keep reading.</p></body></html>`);

    const result = await fetchFullArticleBody("https://www.post-gazette.com/local/story");

    expect(result).toEqual({ body: "", author: undefined, imageUrl: "https://cdn.example.com/lead.jpg" });
  });

  it("returns null when there is neither a story nor any metadata", async () => {
    serve("<html><body><p>Hi</p></body></html>");
    expect(await fetchFullArticleBody("https://unknown-site.example/story")).toBeNull();
  });

  it("uses the Allegheny Front's .entry-content rather than its first <article> teaser", async () => {
    serve(`<html><body><article><a href="/x">card</a></article><div class="entry-content">${prose}${prose}</div></body></html>`);
    const result = await fetchFullArticleBody("https://www.alleghenyfront.org/some-story");
    expect(result.body).toContain("downtown today");
  });
});
