import { XMLParser } from "fast-xml-parser";
import { Platform } from "react-native";
import { Article, ArticleCategory } from "../types/Article";
import { FeedSource, RSS_FEEDS } from "../data/feedConfig";
import { ErrorCode, ErrorHandler } from "../utils/errorCodes";
import { loadSourcePreferences, isSourceEnabled } from "../utils/sourcePreferences";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

type CategoryCache = {
  articles: Article[];
  fetchedAt: number;
};

type FeedFetchFailure = {
  sourceName: string;
  code: ErrorCode;
  message: string;
};

type SingleFeedResult = {
  sourceName: string;
  articles: Article[];
  failure?: FeedFetchFailure;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT_MS = 7000;
const categoryCache = new Map<ArticleCategory, CategoryCache>();
const FETCH_HEADERS: RequestInit["headers"] = {
  // Some publishers (e.g., WTAE) block default fetch UA; send a browser-ish string.
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

export const getLastFetchedAt = (category: ArticleCategory): number | null => {
  const cached = categoryCache.get(category);
  return cached ? cached.fetchedAt : null;
};

export const getCachedArticles = (category: ArticleCategory): Article[] | null => {
  const cached = categoryCache.get(category);
  if (!cached || !cached.articles?.length) return null;
  return cached.articles;
};

const getFeedErrorCode = (error: unknown, fallbackCode: ErrorCode): ErrorCode => {
  if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
    return ErrorCode.NETWORK_TIMEOUT;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("abort") || message.includes("timeout")) {
    return ErrorCode.NETWORK_TIMEOUT;
  }
  if (message.includes("network") || message.includes("fetch")) {
    return ErrorCode.NETWORK_REQUEST_FAILED;
  }

  return fallbackCode;
};

const createFeedLoadError = (category: ArticleCategory, failures: FeedFetchFailure[]) => {
  const code = failures.some((failure) => failure.code === ErrorCode.NETWORK_TIMEOUT)
    ? ErrorCode.NETWORK_TIMEOUT
    : failures.some((failure) => failure.code === ErrorCode.NETWORK_REQUEST_FAILED)
      ? ErrorCode.NETWORK_REQUEST_FAILED
      : ErrorCode.RSS_PARSE_FAILED;
  const details = failures
    .map((failure) => `${failure.sourceName}: ${failure.message}`)
    .join("; ");
  const appError = ErrorHandler.createError(
    code,
    `Failed to load ${category} feeds`,
    details,
    true,
  );
  const error = new Error(appError.userMessage) as Error & {
    code?: ErrorCode;
    details?: string;
    failures?: FeedFetchFailure[];
    userMessage?: string;
  };
  error.name = "FeedLoadError";
  error.code = appError.code;
  error.details = details;
  error.failures = failures;
  error.userMessage = appError.userMessage;
  return error;
};

const fetchWithTimeout = async (url: string): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal, headers: FETCH_HEADERS });
  } finally {
    clearTimeout(timeoutId);
  }
};

const RSS2JSON_ENDPOINT = "https://api.rss2json.com/v1/api.json?rss_url=";

const normalizeRss2JsonItem = (item: any) => {
  const enclosureUrl = item.enclosure?.link;
  const enclosureType = item.enclosure?.type;
  const thumbnail = item.thumbnail || item.enclosure?.thumbnail;

  const normalized: any = {
    title: item.title,
    description: item.description || item.contentSnippet,
    content: item.content,
    "content:encoded": item.content,
    link: item.link,
    pubDate: item.pubDate || item.published,
    guid: item.guid || item.link,
  };

  if (enclosureUrl) {
    normalized.enclosure = {
      "@_url": enclosureUrl,
      "@_type": enclosureType,
    };
    normalized["media:content"] = [
      {
        "@_url": enclosureUrl,
        "@_type": enclosureType,
      },
    ];
  }

  if (thumbnail) {
    normalized["itunes:image"] = { "@_href": thumbnail };
  }

  return normalized;
};

const fetchViaRss2Json = async (url: string) => {
  try {
    const response = await fetchWithTimeout(`${RSS2JSON_ENDPOINT}${encodeURIComponent(url)}`);
    if (!response.ok) {
      console.warn(`rss2json non-OK ${response.status} for ${url}`);
      return null;
    }

    const json = await response.json();
    if (json.status !== "ok" || !json.items) {
      console.warn(`rss2json missing items for ${url}`);
      return null;
    }

    return json.items.map(normalizeRss2JsonItem);
  } catch (error) {
    console.warn(`rss2json fallback failed for ${url}`, error);
    return null;
  }
};

const calculateReadTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

const extractMediaFromHtml = (html: string) => {
  const images = new Set<string>();
  const videos = new Set<string>();

  if (html) {
    const imgMatches = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)];
    imgMatches.forEach((m) => images.add(m[1]));

    const videoMatches = [...html.matchAll(/<video[^>]*>.*?<source[^>]+src="([^"]+)"/gis)];
    videoMatches.forEach((m) => videos.add(m[1]));

    const srcVideoMatches = [...html.matchAll(/<source[^>]+src="([^"]+)"[^>]*type="video\//gi)];
    srcVideoMatches.forEach((m) => videos.add(m[1]));
  }

  return {
    images: Array.from(images),
    videos: Array.from(videos),
  };
};

const sanitizeText = (text: any): string => {
  if (!text) return "";
  if (typeof text !== "string") {
    // fast-xml-parser might return an object if the tag has attributes/children
    // try to extract text content if it's a known structure, or just return empty
    return text["#text"] || "";
  }
  let clean = text
    .replace(/<br\s*\/?/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>?/gm, "") // Strip remaining tags
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#039;/g, "'") // Fix common apostrophe issue
    .replace(/&#39;/g, "'") // Alternate apostrophe
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');

  clean = clean
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return clean;
};

const extractParagraphsFromHtml = (html: string): string => {
  if (!html) return "";
  const paragraphMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (!paragraphMatches || paragraphMatches.length === 0) {
    return sanitizeText(html);
  }

  const paragraphs = paragraphMatches
    .map((p) => {
      // strip the wrapping <p> tags but keep inner text
      const inner = p.replace(/^<p[^>]*>/i, "").replace(/<\/p>$/i, "");
      return sanitizeText(inner);
    })
    .filter(Boolean);

  return paragraphs.join("\n\n");
};

const fetchFullArticleBody = async (link?: string): Promise<string | null> => {
  if (!link) return null;
  try {
    const response = await fetchWithTimeout(link);
    if (!response.ok) return null;
    const html = await response.text();

    // Prefer content inside <article> if present
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const bodyHtml = articleMatch ? articleMatch[1] : html;

    const text = extractParagraphsFromHtml(bodyHtml);
    return text && text.length > 300 ? text : null;
  } catch (error) {
    console.warn("Failed to fetch full article body", error);
    return null;
  }
};

const mapRssItemToArticle = (item: any, category: ArticleCategory, sourceName: string): Article => {
  const content = item["content:encoded"] || item.content || item.description || "";
  // We now preserve the HTML in the body so the parser can handle images and structure
  // We still sanitize the summary for the card view
  const summaryText = sanitizeText(item.description || item.title || "");
  const headline = sanitizeText(item.title?.trim() || "Untitled"); // Sanitize headline too!

  // Extract image from enclosure or media:content or itunes:image
  let imageUrl: string | undefined;
  const mediaImages = new Set<string>();
  const mediaVideos = new Set<string>();
  if (item.enclosure && item.enclosure["@_url"]) {
    const url = item.enclosure["@_url"];
    if (item.enclosure["@_type"]?.startsWith("video")) {
      mediaVideos.add(url);
    } else {
      imageUrl = imageUrl || url;
      mediaImages.add(url);
    }
  }

  const mediaContent = item["media:content"];
  if (mediaContent) {
    const contents = Array.isArray(mediaContent) ? mediaContent : [mediaContent];
    contents.forEach((mc: any) => {
      const url = mc?.["@_url"];
      if (!url) return;
      const type = mc?.["@_type"] || mc?.type;
      if (type?.startsWith("video")) {
        mediaVideos.add(url);
      } else {
        if (!imageUrl) imageUrl = url;
        mediaImages.add(url);
      }
    });
  }

  if (item["itunes:image"] && item["itunes:image"]["@_href"]) {
    const url = item["itunes:image"]["@_href"];
    if (!imageUrl) imageUrl = url;
    mediaImages.add(url);
  }

  // Fallback: Try to find an image in the description or content
  if (!imageUrl) {
    // Look for images in figure tags first (usually captions/higher quality)
    const figureMatch = (content || item.description || "").match(
      /<figure[^>]*>.*?<img[^>]+src="([^">]+)".*?<\/figure>/s,
    );

    if (figureMatch) {
      imageUrl = figureMatch[1];
    } else {
      // General image fallback
      const imgMatch = (content || item.description || "").match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        const candidate = imgMatch[1];
        if (!candidate.includes("pixel") && !candidate.includes("emoji")) {
          imageUrl = candidate;
          mediaImages.add(candidate);
        }
      }
    }
  }

  // Sanitize: ensure https
  if (imageUrl && imageUrl.startsWith("http:")) {
    imageUrl = imageUrl.replace("http:", "https:");
  }

  const bodyMedia = extractMediaFromHtml(content || item.description || "");
  bodyMedia.images.forEach((img) => mediaImages.add(img));
  bodyMedia.videos.forEach((vid) => mediaVideos.add(vid));

  // Extract GUID/ID as a string (it can sometimes be an object from fast-xml-parser)
  const extractId = (val: any): string | undefined => {
    if (!val) return undefined;
    if (typeof val === "string") return val;
    return val["#text"] || val.toString();
  };

  const articleId =
    extractId(item.guid) ||
    extractId(item.id) ||
    extractId(item.link) ||
    Math.random().toString(36).substring(2, 9);

  return {
    id: articleId,
    headline: headline,
    summary: summaryText.substring(0, 150) + (summaryText.length > 150 ? "..." : ""),
    body: content, // Pass RAW content
    source: sourceName,
    timestamp: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Recently",
    publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
    category: category,
    imageUrl: imageUrl,
    mediaImages: Array.from(mediaImages),
    mediaVideos: Array.from(mediaVideos),
    readTimeMinutes: calculateReadTime(summaryText), // Approx
    isSensitive: false,
    link: item.link,
  };
};

export const fetchArticlesByCategory = async (
  category: ArticleCategory,
  options: { forceRefresh?: boolean } = {},
): Promise<Article[]> => {
  const now = Date.now();
  const cached = categoryCache.get(category);
  if (
    !options.forceRefresh &&
    cached &&
    cached.articles.length > 0 &&
    now - cached.fetchedAt < CACHE_TTL_MS
  ) {
    return cached.articles;
  }

  const feeds = RSS_FEEDS[category];

  // feeds is now an array of objects
  const feedSources = Array.isArray(feeds) ? feeds : [feeds];

  if (!feedSources || feedSources.length === 0) {
    console.warn(`No feed found for category: ${category} - RssService.ts:126`);
    return [];
  }

  // Helper to fetch one feed
  // Now accepts the whole FeedSource object
  const fetchSingleFeed = async (source: FeedSource): Promise<SingleFeedResult> => {
    try {
      console.log(`Fetching ${source.name} (${source.url})... - RssService.ts:134`);
      const sourceName = source.name;
      const isWeb = Platform.OS === "web";
      const proxyUrl = "https://corsproxy.io/?";
      const proxyAlt = "https://api.allorigins.win/raw?url=";

      // Try direct first (native), then primary proxy, then alternate proxy.
      const targets: string[] = [];
      if (!isWeb) {
        targets.push(source.url);
      }
      targets.push(proxyUrl + encodeURIComponent(source.url));
      targets.push(proxyAlt + encodeURIComponent(source.url));

      let response: Response | null = null;
      let lastFetchError: unknown = null;
      for (const url of targets) {
        try {
          response = await fetchWithTimeout(url);
          if (response.ok) break;
          console.warn(`Non-OK response ${response.status} for ${url}`);
          lastFetchError = new Error(`HTTP ${response.status}`);
        } catch (err) {
          console.warn(`Fetch attempt failed for ${url} - RssService.ts:143`, err);
          lastFetchError = err;
        }
      }

      if (!response || !response.ok) {
        console.warn(`All fetch attempts failed for ${sourceName} (${source.url})`);

        const rssJsonItems = await fetchViaRss2Json(source.url);
        if (rssJsonItems?.length) {
          console.log(
            `Fetched ${rssJsonItems.length} items via rss2json for ${sourceName} - RssService.ts:150`,
          );
          return {
            sourceName,
            articles: rssJsonItems.map((item: any) =>
              mapRssItemToArticle(item, category, sourceName),
            ),
          };
        }

        return {
          sourceName,
          articles: [],
          failure: {
            sourceName,
            code: getFeedErrorCode(lastFetchError, ErrorCode.NETWORK_REQUEST_FAILED),
            message:
              lastFetchError instanceof Error
                ? lastFetchError.message
                : "All fetch attempts failed.",
          },
        };
      }

      const text = await response.text();
      const result = parser.parse(text);

      const hasStructuredFeed =
        result?.rss?.channel !== undefined || result?.feed !== undefined;
      if (!hasStructuredFeed) {
        return {
          sourceName,
          articles: [],
          failure: {
            sourceName,
            code: ErrorCode.RSS_PARSE_FAILED,
            message: "Feed response did not contain a readable channel.",
          },
        };
      }

      const channel = result?.rss?.channel ?? result?.feed ?? {};
      const channelData = channel && typeof channel === "object" ? channel : {};
      const items = channelData.item || channelData.entry || [];
      const itemsArray = Array.isArray(items) ? items : [items];
      const normalizedItems = itemsArray.filter(Boolean);

      // Use the configured name, ignore the XML title which can be messy
      console.log(`Fetched ${normalizedItems.length} items from ${sourceName} - RssService.ts:154`);

      if (normalizedItems.length === 0) {
        return { sourceName, articles: [] };
      }

      // Map and optionally enrich (e.g., WTAE often ships summaries only)
      const mapped = await Promise.all(
        normalizedItems.map(async (item: any) => {
          try {
            // Keep feed fetch fast; do not fetch full bodies here (handled in ArticleScreen)
            return mapRssItemToArticle(item, category, sourceName);
          } catch (err) {
            console.warn("Failed to map article", err);
            return mapRssItemToArticle(item, category, sourceName);
          }
        }),
      );

      return { sourceName, articles: mapped };
    } catch (error) {
      console.error(`Error fetching/parsing ${source.url}: - RssService.ts:158`, error);
      return {
        sourceName: source.name,
        articles: [],
        failure: {
          sourceName: source.name,
          code: getFeedErrorCode(error, ErrorCode.RSS_PARSE_FAILED),
          message: error instanceof Error ? error.message : "Failed to fetch or parse feed.",
        },
      };
    }
  };

  // Fetch all concurrently
  const prefs = await loadSourcePreferences();
  let sourcesToFetch = feedSources.filter((src) =>
    isSourceEnabled(prefs.overrides, category, src.name, src.defaultEnabled ?? true),
  );

  if (sourcesToFetch.length === 0) {
    const defaultEnabledSources = feedSources.filter((src) => src.defaultEnabled ?? true);
    console.warn(
      `All sources are disabled for ${category}. Overrides: ${JSON.stringify(
        prefs.overrides?.[category] ?? {},
      )}. Falling back to default-enabled sources: ${
        defaultEnabledSources.map((s) => s.name).join(", ") || "none"
      }`,
    );

    if (defaultEnabledSources.length === 0) {
      console.warn(`No default-enabled sources available for ${category}; returning empty list.`);
      return [];
    }

    sourcesToFetch = defaultEnabledSources;
  }

  console.log(
    `Fetching ${sourcesToFetch.length} sources for ${category}: ${sourcesToFetch
      .map((s) => s.name)
      .join(", ")}`,
  );

  const results = await Promise.all(sourcesToFetch.map((src) => fetchSingleFeed(src)));

  // Flatten and separate into buckets for sorting
  const flatArticles = results.flatMap((result) => result.articles);
  const failures = results.flatMap((result) => (result.failure ? [result.failure] : []));

  if (flatArticles.length === 0 && failures.length > 0) {
    throw createFeedLoadError(category, failures);
  }

  const allArticles = flatArticles.sort((a, b) => {
    const publishedDiff = b.publishedAt - a.publishedAt;
    if (publishedDiff !== 0) {
      return publishedDiff;
    }

    const bodyLengthDiff = b.body.length - a.body.length;
    if (bodyLengthDiff !== 0) {
      return bodyLengthDiff;
    }

    return a.headline.localeCompare(b.headline);
  });

  if (failures.length > 0) {
    console.warn(
      `Partial feed failure for ${category}: ${failures
        .map((failure) => `${failure.sourceName} (${failure.code})`)
        .join(", ")}`,
    );
  }

  // Avoid caching an empty result so the next call can retry other fallbacks
  if (allArticles.length > 0) {
    categoryCache.set(category, { articles: allArticles, fetchedAt: now });
  }
  return allArticles;
};

export const fetchAllArticles = async (): Promise<Article[]> => {
  const categories = Object.keys(RSS_FEEDS) as ArticleCategory[];
  const results = await Promise.all(categories.map((cat) => fetchArticlesByCategory(cat)));
  return results.flat();
};
