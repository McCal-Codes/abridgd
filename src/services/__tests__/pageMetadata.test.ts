import { parse } from "node-html-parser";
import { extractPageMetadata } from "../pageMetadata";

const page = (head: string) => parse(`<html><head>${head}</head><body></body></html>`);
const URL_ = "https://triblive.com/local/story/";

describe("extractPageMetadata", () => {
  it("reads the lead photo from og:image", () => {
    const meta = extractPageMetadata(page('<meta property="og:image" content="https://cdn.example.com/lead.jpg">'), URL_);
    expect(meta.imageUrl).toBe("https://cdn.example.com/lead.jpg");
  });

  it("resolves a relative image against the page", () => {
    const meta = extractPageMetadata(page('<meta property="og:image" content="/img/lead.jpg">'), URL_);
    expect(meta.imageUrl).toBe("https://triblive.com/img/lead.jpg");
  });

  it("falls back to JSON-LD, including an @graph, an ImageObject and a list of images", () => {
    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", name: "Site" },
        { "@type": "NewsArticle", image: [{ "@type": "ImageObject", url: "https://cdn.example.com/ld.jpg" }, "https://cdn.example.com/other.jpg"], author: [{ "@type": "Person", name: "Paula Reed Ward" }] },
      ],
    };
    const meta = extractPageMetadata(page(`<script type="application/ld+json">${JSON.stringify(ld)}</script>`), URL_);
    expect(meta.imageUrl).toBe("https://cdn.example.com/ld.jpg");
    expect(meta.author).toBe("Paula Reed Ward");
  });

  it("falls back to twitter:image, and prefers og:image when both exist", () => {
    expect(extractPageMetadata(page('<meta name="twitter:image" content="https://cdn.example.com/tw.jpg">'), URL_).imageUrl).toBe(
      "https://cdn.example.com/tw.jpg",
    );
    const both = page('<meta name="twitter:image" content="https://cdn.example.com/tw.jpg"><meta property="og:image" content="https://cdn.example.com/og.jpg">');
    expect(extractPageMetadata(both, URL_).imageUrl).toBe("https://cdn.example.com/og.jpg");
  });

  it("rejects tracking beacons and non-http values, then tries the next candidate", () => {
    const meta = extractPageMetadata(
      page('<meta property="og:image" content="https://t.example.com/pixel.gif?w=1&h=1"><meta name="twitter:image" content="https://cdn.example.com/real.jpg">'),
      URL_,
    );
    expect(meta.imageUrl).toBe("https://cdn.example.com/real.jpg");
    expect(extractPageMetadata(page('<meta property="og:image" content="javascript:alert(1)">'), URL_).imageUrl).toBeUndefined();
  });

  it("survives malformed JSON-LD", () => {
    const meta = extractPageMetadata(page('<script type="application/ld+json">{not json</script>'), URL_);
    expect(meta).toEqual({ imageUrl: undefined, author: undefined });
  });

  it("ignores an author that is a URL or implausibly long", () => {
    const ld = { "@type": "Article", author: { name: "https://example.com/team" } };
    expect(extractPageMetadata(page(`<script type="application/ld+json">${JSON.stringify(ld)}</script>`), URL_).author).toBeUndefined();
  });
});
