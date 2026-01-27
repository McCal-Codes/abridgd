import { parse } from "node-html-parser";

const PROXY_URL = "https://corsproxy.io/?";
const FETCH_TIMEOUT_MS = 7000;

const fetchWithTimeout = async (url: string, init: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const SELECTORS: Record<string, string[]> = {
  "wtae.com": [".article-content", ".article-body-content"],
  "publicsource.org": [".entry-content", "article"],
  "pittsburghmagazine.com": [".entry-content", "article"],
  "steelers.com": [".nfl-c-article__body", ".article-content"],
  "pghcitypaper.com": [".entry-content", ".story-body", "#story-body-content"],
  "triblive.com": [".entry-content", "article", ".story-content"],
  "cbsnews.com": [".content__body", ".content-body"],
  "wpxi.com": [".article-body", ".story-body"],
};

export const fetchFullArticleBody = async (url: string): Promise<string | null> => {
  if (!url) return null;

  try {
    if (url.includes("triblive.com")) {
      try {
        // TribLive uses WordPress, try to fetch via API first
        // Extract slug: https://triblive.com/.../.../cleanup-continues/ -> cleanup-continues
        const parts = url.split("/").filter((p) => p.length > 0);
        const slug = parts[parts.length - 1];

        const apiUrl = `https://triblive.com/wp-json/wp/v2/posts?slug=${slug}&_fields=content`;
        const apiProxyUrl = PROXY_URL + encodeURIComponent(apiUrl);

        const apiRes = await fetch(apiProxyUrl);
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (Array.isArray(data) && data.length > 0 && data[0].content?.rendered) {
            console.log("Successfully fetched TribLive content via API - FullStoryService.ts:46");
            return data[0].content.rendered;
          }
        }
      } catch (e) {
        console.warn(
          "TribLive API fetch failed, falling back to scrape - FullStoryService.ts:51",
          e,
        );
      }
    }

    console.log(`Fetching full content for: ${url} - FullStoryService.ts:55`);
    const proxyUrl = PROXY_URL + encodeURIComponent(url);

    // Try direct first to allow native to bypass proxy blocks, then proxy as fallback.
    const targets = [url, proxyUrl];
    let response: Response | null = null;
    for (const target of targets) {
      try {
        response = await fetchWithTimeout(target, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
          },
        });
        if (response.ok) break;
        console.warn(
          `NonOK response ${response.status} for full story ${target} - FullStoryService.ts:69`,
        );
      } catch (err) {
        console.warn(`Full story fetch failed for ${target} - FullStoryService.ts:71`, err);
      }
    }

    if (!response || !response.ok) throw new Error(`Status ${response?.status ?? "unknown"}`);

    const html = await response.text();
    const root = parse(html);

    // Determine domain
    const domain = Object.keys(SELECTORS).find((d) => url.includes(d));
    const candidates = domain
      ? SELECTORS[domain]
      : ["article", "main", ".entry-content", ".content"];

    let contentNode = null;
    for (const selector of candidates) {
      contentNode = root.querySelector(selector);
      if (contentNode) break;
    }

    if (contentNode) {
      // fast-html-parser structure gives us 'innerHTML' or we can reconstruct it?
      // fast-html-parser doesn't have .innerHTML access directly in all versions,
      // but usually valid RSS parsers used earlier returned raw HTML.
      // Let's check fast-html-parser docs or properties.
      // It has .toString() on the node which returns the outer HTML usually.

      // We want the inner HTML to keep structure
      return contentNode.innerHTML;
    }

    return null; // No content found
  } catch (error) {
    console.error("Error fetching full story: - FullStoryService.ts:105", error);
    return null;
  }
};
