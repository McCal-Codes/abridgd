import { XMLParser } from "fast-xml-parser";
import { Article, ArticleCategory } from "../../types/Article";
import { RawFeedItem, ProvenanceContext } from "./types";
import { calculateReadTime, extractMediaFromHtml, sanitizeText } from "./htmlUtils";

const SUMMARY_MAX_LENGTH = 150;

/** Truncates at the nearest word boundary instead of cutting mid-word/mid-sentence,
 * unless the last word before the limit starts too early in the string to be worth
 * keeping (in which case a hard cut reads better than an overly short summary). */
const truncateAtWordBoundary = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
};

/** RSS 2.0 <author> is conventionally "email@example.com (Full Name)"; Atom's
 * <author><name>...</name></author> and RSS's <dc:creator> are usually a plain name. */
const extractAuthorName = (raw: unknown): string | undefined => {
  if (!raw) return undefined;

  let text: string | undefined;
  if (typeof raw === "string") {
    text = raw;
  } else if (typeof raw === "object") {
    const obj = raw as { "#text"?: string; name?: unknown };
    if (obj.name) {
      text = typeof obj.name === "string" ? obj.name : ((obj.name as any)?.["#text"] as string | undefined);
    } else if (obj["#text"]) {
      text = obj["#text"];
    }
  }
  if (!text) return undefined;

  const parenMatch = text.match(/\(([^)]+)\)/);
  const candidate = parenMatch ? parenMatch[1] : text;

  const cleaned = sanitizeText(candidate).replace(/^by\s+/i, "").trim();
  if (!cleaned || cleaned.includes("@") || cleaned.length > 80) return undefined;
  return cleaned;
};

const parseDeclaredWidth = (val: unknown): number => {
  const n = typeof val === "string" ? parseInt(val, 10) : typeof val === "number" ? val : NaN;
  return Number.isFinite(n) ? n : 0;
};

type ImageCandidate = { url: string; width: number; priority: number };

/** Picks the best imageUrl among candidates: prefer the largest declared width when any
 * candidate reports one, otherwise fall back to source priority (media:content is
 * purpose-built article media; enclosure is often reused for a generic/low-res thumbnail
 * on WordPress-based sources, so it ranks below media:content and itunes:image). */
const pickBestImage = (candidates: ImageCandidate[]): string | undefined => {
  if (!candidates.length) return undefined;
  const withWidth = candidates.filter((c) => c.width > 0);
  const pool = withWidth.length ? withWidth : candidates;
  return pool.reduce((best, c) => {
    if (!best) return c;
    if (c.width !== best.width) return c.width > best.width ? c : best;
    return c.priority < best.priority ? c : best;
  }).url;
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

/** Parses an RSS 2.0 or Atom XML document into a flat list of raw items. Returns null when the
 * response doesn't contain a readable channel/feed (e.g. an HTML error page served as XML). */
export const parseFeedXml = (xml: string): { items: RawFeedItem[]; isAtom: boolean } | null => {
  const result = xmlParser.parse(xml);

  const hasStructuredFeed = result?.rss?.channel !== undefined || result?.feed !== undefined;
  if (!hasStructuredFeed) {
    return null;
  }

  const isAtom = result?.rss?.channel === undefined && result?.feed !== undefined;
  const channel = result?.rss?.channel ?? result?.feed ?? {};
  const channelData = channel && typeof channel === "object" ? channel : {};
  const items = channelData.item || channelData.entry || [];
  const itemsArray = Array.isArray(items) ? items : [items];

  return { items: itemsArray.filter(Boolean) as RawFeedItem[], isAtom };
};

/**
 * RSS gives `<link>` as text; Atom gives `<link rel="alternate" href="...">`, which
 * fast-xml-parser turns into an attribute object - or an array of them when a feed also
 * declares self/replies links. Without this, `article.link` was an object: "Read Full
 * Story" called Linking.openURL with it, and full-story enrichment hashed it as a string.
 */
const extractLink = (val: RawFeedItem["link"]): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val.trim() || undefined;

  const candidates = Array.isArray(val) ? val : [val];
  const alternate = candidates.find((entry) => entry?.["@_rel"] === "alternate");
  const untyped = candidates.find((entry) => !entry?.["@_rel"]);
  const href = (alternate || untyped || candidates[0])?.["@_href"];
  return typeof href === "string" && href.trim() ? href.trim() : undefined;
};

/**
 * `new Date()` handles ISO-8601 per spec, but RFC-822 - the format RSS actually mandates -
 * is implementation-defined, and Hermes' fallback parser is narrower than V8's. Alphabetic
 * zones (EST, PDT) are the usual casualty. Normalise those to a numeric offset so the
 * engine's ISO path can take them.
 */
const RFC822_ZONES: Record<string, string> = {
  UT: "+0000", GMT: "+0000", Z: "+0000",
  EST: "-0500", EDT: "-0400",
  CST: "-0600", CDT: "-0500",
  MST: "-0700", MDT: "-0600",
  PST: "-0800", PDT: "-0700",
};

const parseFeedDate = (raw?: string): number => {
  if (!raw) return NaN;
  const value = String(raw).trim();
  if (!value) return NaN;

  const direct = new Date(value).getTime();
  if (!Number.isNaN(direct)) return direct;

  const zoneMatch = value.match(/\s([A-Z]{2,3})$/);
  if (zoneMatch && RFC822_ZONES[zoneMatch[1]]) {
    const retried = new Date(value.replace(/\s[A-Z]{2,3}$/, ` ${RFC822_ZONES[zoneMatch[1]]}`)).getTime();
    if (!Number.isNaN(retried)) return retried;
  }

  return NaN;
};

const extractId = (val: RawFeedItem["guid"]): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return (val["#text"] as string | undefined) || undefined;
};

/** Turns a single raw feed item into a fully-formed Article, including provenance. Pure and
 * network/cache-agnostic — callers plumb in whatever they know about the source's last
 * successful refresh rather than this function reaching into the cache itself. */
export const normalizeFeedItem = (
  item: RawFeedItem,
  category: ArticleCategory,
  sourceName: string,
  provenance: ProvenanceContext,
): Article => {
  const content = sanitizeContentField(item["content:encoded"] || item.content || item.description || "");
  const summaryText = sanitizeText(item.description || item.summary || item.title || "");
  const headline = sanitizeText(textOf(item.title)?.trim() || "Untitled");

  // Extract image from enclosure, media:content, or itunes:image. Candidates are scored
  // by declared width (falling back to source priority) rather than "whichever resolves
  // first" — see pickBestImage for why.
  let imageUrl: string | undefined;
  const mediaImages = new Set<string>();
  const mediaVideos = new Set<string>();
  const imageCandidates: ImageCandidate[] = [];

  if (item.enclosure && item.enclosure["@_url"]) {
    const url = item.enclosure["@_url"];
    if (item.enclosure["@_type"]?.startsWith("video")) {
      mediaVideos.add(url);
    } else {
      mediaImages.add(url);
      imageCandidates.push({ url, width: parseDeclaredWidth(item.enclosure["@_width"]), priority: 2 });
    }
  }

  const mediaContent = item["media:content"];
  if (mediaContent) {
    const contents = Array.isArray(mediaContent) ? mediaContent : [mediaContent];
    contents.forEach((mc) => {
      const url = mc?.["@_url"];
      if (!url) return;
      const type = mc?.["@_type"];
      if (typeof type === "string" && type.startsWith("video")) {
        mediaVideos.add(url);
      } else {
        mediaImages.add(url);
        imageCandidates.push({ url, width: parseDeclaredWidth(mc?.["@_width"]), priority: 0 });
      }
    });
  }

  if (item["itunes:image"] && item["itunes:image"]["@_href"]) {
    const url = item["itunes:image"]["@_href"];
    mediaImages.add(url);
    imageCandidates.push({ url, width: 0, priority: 1 });
  }

  imageUrl = pickBestImage(imageCandidates);

  // Fallback: Try to find an image in the description or content
  if (!imageUrl) {
    const rawContent = content || textOf(item.description) || "";
    const figureMatch = rawContent.match(/<figure[^>]*>.*?<img[^>]+src="([^">]+)".*?<\/figure>/s);

    if (figureMatch) {
      imageUrl = figureMatch[1];
    } else {
      const imgMatch = rawContent.match(/<img[^>]+src="([^">]+)"/);
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

  const bodyMedia = extractMediaFromHtml(content || textOf(item.description) || "");
  bodyMedia.images.forEach((img) => mediaImages.add(img));
  bodyMedia.videos.forEach((vid) => mediaVideos.add(vid));

  const author = extractAuthorName(item["dc:creator"]) || extractAuthorName(item.author);

  const link = extractLink(item.link);

  /**
   * The id keys saved articles and reading progress, so it has to be stable across
   * refreshes. It previously fell back to Math.random(), which minted a new id every
   * parse - silently detaching a reader's progress and saved state whenever a feed
   * lacked guid/id/link. Headline plus source is a deterministic last resort.
   *
   * Namespaced by source because raw guids are not unique across publishers: integer
   * guids are common on WordPress, so two outlets could collide and cross-contaminate
   * each other's reading progress.
   */
  const rawId = extractId(item.guid) || extractId(item.id) || link || `${headline}`;
  const articleId = `${sourceName}::${rawId}`;

  const dateSource = item.pubDate || item.published || item.updated || item["dc:date"];
  const parsedDate = parseFeedDate(dateSource);

  /**
   * Unparseable dates sort last, not first. The previous fallback was Date.now(), which
   * meant one source with a format the engine could not read had its entire item list
   * stacked above every genuinely-dated article - and the value was persisted, so it
   * survived restarts.
   */
  const publishedAt = Number.isNaN(parsedDate) ? 0 : parsedDate;
  const timestamp = Number.isNaN(parsedDate)
    ? "Recently"
    : new Date(parsedDate).toLocaleDateString();

  return {
    id: articleId,
    headline,
    summary: truncateAtWordBoundary(summaryText, SUMMARY_MAX_LENGTH),
    body: content, // Pass RAW content
    source: sourceName,
    author,
    timestamp,
    publishedAt,
    category,
    imageUrl,
    mediaImages: Array.from(mediaImages),
    mediaVideos: Array.from(mediaVideos),
    readTimeMinutes: calculateReadTime(summaryText),
    isSensitive: false,
    link,
    provenance: {
      sourceName,
      sourceDomain: provenance.sourceDomain,
      category,
      publishedAt,
      inclusionReason: `Included because ${sourceName} is an enabled source in your ${category} feed.`,
      sourceLastRefreshedAt: provenance.sourceLastRefreshedAt,
    },
  };
};

const textOf = (val: RawFeedItem["title"]): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return val["#text"] as string | undefined;
};

const sanitizeContentField = (val: RawFeedItem["content"]): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return (val["#text"] as string | undefined) || "";
};
