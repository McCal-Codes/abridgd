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
  const summaryText = sanitizeText(item.description || item.title || "");
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

  const articleId =
    extractId(item.guid) ||
    extractId(item.id) ||
    (typeof item.link === "string" ? item.link : undefined) ||
    Math.random().toString(36).substring(2, 9);

  const dateSource = item.pubDate || item.published || item.updated;
  const parsedDate = dateSource ? new Date(dateSource).getTime() : NaN;
  const publishedAt = Number.isNaN(parsedDate) ? Date.now() : parsedDate;
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
    link: item.link,
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
