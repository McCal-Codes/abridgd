import { RawFeedItem } from "./types";

export const FETCH_TIMEOUT_MS = 7000;

const FETCH_HEADERS: Record<string, string> = {
  // Some publishers (e.g., WTAE) block default fetch UA; send a browser-ish string.
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

const RSS2JSON_ENDPOINT = "https://api.rss2json.com/v1/api.json?rss_url=";
const PROXY_URL = "https://corsproxy.io/?";
const PROXY_ALT_URL = "https://api.allorigins.win/raw?url=";

/** `extraHeaders` override the defaults, e.g. a JSON endpoint that content-negotiates on Accept. */
export const fetchWithTimeout = async (
  url: string,
  extraHeaders?: Record<string, string>,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: extraHeaders ? { ...FETCH_HEADERS, ...extraHeaders } : FETCH_HEADERS,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

/** Builds the ordered list of URLs to attempt for a given feed.
 *
 * Native requests go straight to the publisher: there is no CORS on device, and a proxy would
 * learn which feeds the reader follows. The CORS proxies exist only for the web build, where a
 * browser blocks direct cross-origin feed requests. */
export const buildFetchTargets = (url: string, isWeb: boolean): string[] =>
  isWeb ? [PROXY_URL + encodeURIComponent(url), PROXY_ALT_URL + encodeURIComponent(url)] : [url];

/** Attempts each target in order, returning the first ok response. Returns the last error
 * encountered (if any) so callers can report a useful failure reason. */
export const fetchFeedXml = async (
  url: string,
  isWeb: boolean,
): Promise<{ response: Response | null; error: unknown }> => {
  const targets = buildFetchTargets(url, isWeb);
  let response: Response | null = null;
  let lastError: unknown = null;

  for (const target of targets) {
    try {
      response = await fetchWithTimeout(target);
      if (response.ok) return { response, error: null };
      console.warn(`Non-OK response ${response.status} for ${target}`);
      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      console.warn(`Fetch attempt failed for ${target}`, err);
      lastError = err;
    }
  }

  return { response: response?.ok ? response : null, error: lastError };
};

/** Raw shape of a single item as returned by the rss2json.com fallback API — distinct from
 * RawFeedItem (fast-xml-parser's shape), since rss2json flattens attributes into plain fields. */
export interface Rss2JsonRawItem {
  title?: string;
  description?: string;
  contentSnippet?: string;
  content?: string;
  link?: string;
  pubDate?: string;
  published?: string;
  guid?: string;
  thumbnail?: string;
  enclosure?: {
    link?: string;
    type?: string;
    thumbnail?: string;
  };
}

export const normalizeRss2JsonItem = (item: Rss2JsonRawItem): RawFeedItem => {
  const enclosureUrl = item.enclosure?.link;
  const enclosureType = item.enclosure?.type;
  const thumbnail = item.thumbnail || item.enclosure?.thumbnail;

  const normalized: RawFeedItem = {
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

export const fetchViaRss2Json = async (url: string): Promise<RawFeedItem[] | null> => {
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

    return (json.items as Rss2JsonRawItem[]).map(normalizeRss2JsonItem);
  } catch (error) {
    console.warn(`rss2json fallback failed for ${url}`, error);
    return null;
  }
};
