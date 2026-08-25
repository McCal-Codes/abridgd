import { FastXmlTextNode } from "./types";
import { decodeHtmlEntities } from "../../utils/htmlEntities";

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
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/blockquote>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]*>?/gm, ""); // Strip remaining tags

  clean = decodeHtmlEntities(clean);

  clean = clean
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return clean;
};
