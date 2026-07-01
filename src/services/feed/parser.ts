import { XMLParser } from "fast-xml-parser";
import { Article, ArticleCategory } from "../../types/Article";
import { RawFeedItem, ProvenanceContext } from "./types";
import { calculateReadTime, extractMediaFromHtml, sanitizeText } from "./htmlUtils";

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
    contents.forEach((mc) => {
      const url = mc?.["@_url"];
      if (!url) return;
      const type = mc?.["@_type"];
      if (typeof type === "string" && type.startsWith("video")) {
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
    summary: summaryText.substring(0, 150) + (summaryText.length > 150 ? "..." : ""),
    body: content, // Pass RAW content
    source: sourceName,
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
