
import { Platform } from 'react-native';
import { parse } from 'node-html-parser';

const PROXY_URL = 'https://corsproxy.io/?';
const FETCH_TIMEOUT_MS = 7000;

export interface FullStoryContent {
    body: string;
    author?: string;
}

const AUTHOR_SELECTORS = [
    '[rel="author"]',
    '.byline',
    '.author-name',
    '.article-author',
    '.entry-author',
    'a.author',
    '.author',
];

/** Scrapes a byline from the full article page as a fallback for feeds whose RSS
 * doesn't carry an author/dc:creator tag. Tries common byline selectors first, then
 * standard author meta tags. Best-effort — returns undefined rather than a bad guess. */
const extractAuthorFromHtml = (root: ReturnType<typeof parse>): string | undefined => {
    for (const selector of AUTHOR_SELECTORS) {
        try {
            const node = root.querySelector(selector);
            const text = node?.text?.trim();
            if (text) {
                const cleaned = text.replace(/^by\s+/i, '').trim();
                if (cleaned && cleaned.length <= 80) return cleaned;
            }
        } catch {
            // Unsupported selector on this parser version - try the next one.
        }
    }

    for (const metaName of ['author', 'article:author', 'parsely-author']) {
        try {
            const meta = root.querySelector(`meta[name="${metaName}"]`) || root.querySelector(`meta[property="${metaName}"]`);
            const content = meta?.attributes?.content?.trim();
            if (content && content.length <= 80 && !content.includes('://')) return content;
        } catch {
            // Unsupported selector on this parser version - try the next one.
        }
    }

    return undefined;
};

const fetchWithTimeout = async (url: string, init: RequestInit = {}): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }
};

/** Hostname of an http(s) URL, lower-cased, or null. Parsed by hand because React Native's
 * URL implementation is incomplete. */
export const getHostname = (url: string): string | null => {
    const match = /^https?:\/\/([^/:?#\s]+)/i.exec(url.trim());
    return match ? match[1].toLowerCase() : null;
};

/** True when `url`'s host is `domain` or one of its subdomains. A substring test was used
 * before, so `https://evil.example/?triblive.com` matched `triblive.com`. */
export const hostMatchesDomain = (url: string, domain: string): boolean => {
    const host = getHostname(url);
    return host !== null && (host === domain || host.endsWith(`.${domain}`));
};

/** WordPress post slug: the last path segment, and only if it is a plain slug. */
export const extractWordPressSlug = (url: string): string | null => {
    const path = url.split(/[?#]/)[0].replace(/^https?:\/\/[^/]+/i, '');
    const segments = path.split('/').filter((part) => part.length > 0);
    const slug = segments[segments.length - 1];
    return slug && /^[a-z0-9][a-z0-9-]*$/i.test(slug) ? slug : null;
};

// Third-party CORS proxies are only needed in a browser. On native there is no CORS, so
// requests go straight to the publisher and the article URL a reader opens never reaches a
// third party.
const USE_PROXY = Platform.OS === 'web';

const SELECTORS: Record<string, string[]> = {
    'wtae.com': ['.article-content', '.article-body-content'],
    'publicsource.org': ['.entry-content', 'article'],
    'pittsburghmagazine.com': ['.entry-content', 'article'],
    'steelers.com': ['.nfl-c-article__body', '.article-content'],
    'pghcitypaper.com': ['.entry-content', '.story-body', '#story-body-content'],
    'triblive.com': ['.entry-content', 'article', '.story-content'],
    'cbsnews.com': ['.content__body', '.content-body'],
    'wpxi.com': ['.article-body', '.story-body']
};

export const fetchFullArticleBody = async (url: string): Promise<FullStoryContent | null> => {
    if (!url) return null;

    try {
        const slug = hostMatchesDomain(url, 'triblive.com') ? extractWordPressSlug(url) : null;
        if (slug) {
            try {
                // TribLive uses WordPress, so try its REST API before scraping the page.
                const apiUrl = `https://triblive.com/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=content`;
                const apiRes = await fetchWithTimeout(USE_PROXY ? PROXY_URL + encodeURIComponent(apiUrl) : apiUrl);
                if (apiRes.ok) {
                    const data = await apiRes.json();
                    if (Array.isArray(data) && data.length > 0 && data[0].content?.rendered) {
                        return { body: data[0].content.rendered };
                    }
                }
            } catch (e) {
                // Deliberately no URL in the log: breadcrumbs must not record what was read.
                console.warn('TribLive API fetch failed, falling back to scrape', e);
            }
        }

        const targets = USE_PROXY ? [PROXY_URL + encodeURIComponent(url)] : [url];
        let response: Response | null = null;
        for (const target of targets) {
            try {
                response = await fetchWithTimeout(target, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
                    }
                });
                if (response.ok) break;
                console.warn(`Non-OK response ${response.status} for full story`);
            } catch (err) {
                console.warn('Full story fetch failed', err);
            }
        }

        if (!response || !response.ok) throw new Error(`Status ${response?.status ?? 'unknown'}`);

        const html = await response.text();
        const root = parse(html);

        // Determine domain
        const domain = Object.keys(SELECTORS).find(d => hostMatchesDomain(url, d));
        const candidates = domain ? SELECTORS[domain] : ['article', 'main', '.entry-content', '.content'];

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
            return { body: contentNode.innerHTML, author: extractAuthorFromHtml(root) };
        }

        return null; // No content found
    } catch (error) {
        console.error('Error fetching full story:', error);
        return null;
    }
};
