import { Article, ArticleCategory } from "../../types/Article";
import { ErrorCode } from "../../utils/errorCodes";

/**
 * Shape of a single item/entry as produced by fast-xml-parser for our RSS 2.0 / Atom
 * feeds (ignoreAttributes: false, attributeNamePrefix: "@_"). Text-bearing tags can come
 * back as a plain string or, when the tag has attributes/children, as an object carrying
 * "#text". Attribute-bearing tags (enclosure, media:content, itunes:image) carry "@_*" keys.
 */
export type FastXmlTextNode = string | { "#text"?: string; [key: string]: unknown };

export type FastXmlAttributeNode = {
  "@_url"?: string;
  "@_type"?: string;
  "@_href"?: string;
  "@_width"?: string | number;
  [key: string]: unknown;
};

export type FastXmlAuthorNode = FastXmlTextNode | { name?: FastXmlTextNode };

export interface RawFeedItem {
  title?: FastXmlTextNode;
  link?: string;
  guid?: FastXmlTextNode;
  id?: FastXmlTextNode;
  pubDate?: string;
  published?: string;
  updated?: string;
  description?: FastXmlTextNode;
  content?: FastXmlTextNode;
  "content:encoded"?: FastXmlTextNode;
  summary?: FastXmlTextNode;
  enclosure?: FastXmlAttributeNode;
  "media:content"?: FastXmlAttributeNode | FastXmlAttributeNode[];
  "media:description"?: FastXmlTextNode;
  "media:title"?: FastXmlTextNode;
  "media:credit"?: FastXmlTextNode;
  "itunes:image"?: FastXmlAttributeNode;
  author?: FastXmlAuthorNode;
  "dc:creator"?: FastXmlTextNode;
}

/** Fully-typed, post-extraction article shape. Alias of Article for now — normalizeFeedItem
 * IS the extraction step, so there's no separate intermediate shape worth maintaining. */
export type NormalizedFeedItem = Article;

export interface ProvenanceContext {
  sourceDomain: string;
  sourceLastRefreshedAt: number | null;
}

export type FeedFetchFailure = {
  sourceName: string;
  code: ErrorCode;
  message: string;
};

export type FeedLoadResult = {
  articles: Article[];
  stale: boolean;
  lastUpdated: number | null;
};

export type FeedSourceHealth = "healthy" | "pending-replacement" | "experimental-off";

export type { ArticleCategory };
