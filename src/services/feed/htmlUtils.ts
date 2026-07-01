import { FastXmlTextNode } from "./types";

export const calculateReadTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

export const extractMediaFromHtml = (html: string) => {
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

export const sanitizeText = (text: FastXmlTextNode | undefined | null): string => {
  if (!text) return "";
  if (typeof text !== "string") {
    // fast-xml-parser might return an object if the tag has attributes/children
    return text["#text"] as string | undefined || "";
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

export const extractParagraphsFromHtml = (html: string): string => {
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
