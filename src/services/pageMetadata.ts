import type { HTMLElement } from "node-html-parser";
import { isLikelyTrackingImage, resolveFeedUrl } from "./feed/parser";

export interface PageMetadata {
  /** The story's lead photo, absolute and not a tracking beacon. */
  imageUrl?: string;
  /** The byline, from structured data (the page's selectors are tried separately). */
  author?: string;
}

const ARTICLE_TYPES = /^(News|Blog|Report|Opinion|Analysis|Review)?Article$|^BlogPosting$/i;

const asArray = <T>(value: T | T[] | undefined | null): T[] =>
  value === undefined || value === null ? [] : Array.isArray(value) ? value : [value];

/** Every object in a page's JSON-LD blocks, flattening `@graph` and top-level arrays. */
const jsonLdNodes = (root: HTMLElement): Array<Record<string, unknown>> => {
  const nodes: Array<Record<string, unknown>> = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    nodes.push(record);
    if (record["@graph"]) visit(record["@graph"]);
  };

  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      visit(JSON.parse(script.text));
    } catch {
      // Malformed structured data is common; skip that block.
    }
  }
  return nodes;
};

const isArticleNode = (node: Record<string, unknown>): boolean =>
  asArray(node["@type"] as string | string[] | undefined).some((t) => ARTICLE_TYPES.test(String(t)));

/** `image` is a URL, an ImageObject, or a list of either. */
const firstImageUrl = (value: unknown): string | undefined => {
  for (const item of asArray(value as unknown)) {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const url = (item as Record<string, unknown>).url ?? (item as Record<string, unknown>)["@id"];
      if (typeof url === "string") return url;
    }
  }
  return undefined;
};

/** `author` is a name, a Person/Organization, or a list of them. */
const firstAuthorName = (value: unknown): string | undefined => {
  for (const item of asArray(value as unknown)) {
    const name = typeof item === "string" ? item : (item as Record<string, unknown> | null)?.name;
    if (typeof name === "string" && name.trim() && name.length <= 80 && !name.includes("://")) {
      return name.trim();
    }
  }
  return undefined;
};

const metaContent = (root: HTMLElement, key: string): string | undefined => {
  for (const attr of ["property", "name"]) {
    try {
      const content = root.querySelector(`meta[${attr}="${key}"]`)?.attributes?.content?.trim();
      if (content) return content;
    } catch {
      // unsupported selector
    }
  }
  return undefined;
};

/**
 * The lead photo and byline of a story page, read from metadata every news site publishes for
 * link previews and search: `og:image`, `twitter:image` and JSON-LD. A live check of 19 enabled feeds found four
 * (TribLive, Kidsburgh, NEXTpittsburgh, DK Pittsburgh Sports) whose RSS carries no image at all,
 * while every article page had an `og:image`.
 */
export const extractPageMetadata = (root: HTMLElement, pageUrl: string): PageMetadata => {
  const articleNodes = jsonLdNodes(root).filter(isArticleNode);

  const imageCandidates = [
    metaContent(root, "og:image"),
    metaContent(root, "og:image:url"),
    firstImageUrl(articleNodes.map((n) => n.image).find(Boolean)),
    metaContent(root, "twitter:image"),
  ];

  let imageUrl: string | undefined;
  for (const candidate of imageCandidates) {
    const resolved = resolveFeedUrl(candidate, pageUrl);
    if (resolved && /^https?:\/\//i.test(resolved) && !isLikelyTrackingImage(resolved)) {
      imageUrl = resolved;
      break;
    }
  }

  const author = firstAuthorName(articleNodes.map((n) => n.author).find(Boolean));
  return { imageUrl, author };
};
