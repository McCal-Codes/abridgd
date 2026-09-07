import { ArticleCategory } from "../types/Article";

/** healthy: verified working. pending-replacement: verified broken, disabled until a working
 * replacement is sourced. experimental-off: opt-in/audio/niche feeds left off by default.
 *
 * Health notes carry the date and the actual failure mode. "Non-feed response" is not enough
 * detail to act on later: a 403 bot-block is worth re-probing with different headers, a feed
 * that returns valid RSS with zero items is a publisher-side problem, and a dead domain is
 * gone for good. Run `npm run audit:feeds` to re-check every URL here against the live web. */
export type SourceHealth = "healthy" | "pending-replacement" | "experimental-off";

export type FeedSource = {
  name: string;
  url: string;
  /** Optional default toggle. Defaults to true if omitted. */
  defaultEnabled?: boolean;
  health?: SourceHealth;
  healthNote?: string;
};

export const RSS_FEEDS: Record<ArticleCategory, FeedSource[]> = {
  Top: [
    { name: "WTAE", url: "https://www.wtae.com/topstories-rss", health: "healthy" },
    {
      name: "WPXI",
      url: "https://www.wpxi.com/arc/outboundfeeds/rss/?outputType=xml",
      health: "healthy",
    },
    {
      // The old `/politics-government/rss` path 404s; WESA's feeds live at `<section>.rss`.
      name: "WESA",
      url: "https://www.wesa.fm/politics-government.rss",
      health: "healthy",
    },
    {
      name: "CBS Pittsburgh",
      url: "https://pittsburgh.cbslocal.com/feed/",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "2026-09-05: HTTP 200 serving text/html, not a feed. No successor URL found.",
    },
  ],
  Local: [
    { name: "Public Source", url: "https://www.publicsource.org/feed/", health: "healthy" },
    { name: "TribLive", url: "https://triblive.com/feed/", health: "healthy" },
    { name: "Post-Gazette", url: "https://www.post-gazette.com/rss/local", health: "healthy" },
    { name: "Kidsburgh", url: "https://www.kidsburgh.org/feed/", health: "healthy" },
    {
      name: "Pittsburgh Union Progress",
      url: "https://www.unionprogress.com/feed/",
      health: "healthy",
    },
    { name: "The Allegheny Front", url: "https://www.alleghenyfront.org/feed/", health: "healthy" },
    {
      name: "New Pittsburgh Courier",
      url: "https://newpittsburghcourier.com/feed/",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote:
        "2026-09-05: HTTP 403 bot-block (loads fine in a browser). Worth re-probing if the fetch headers change.",
    },
  ],
  Business: [
    { name: "Post-Gazette Biz", url: "https://www.post-gazette.com/rss/business", health: "healthy" },
    { name: "NEXTpittsburgh", url: "https://www.nextpittsburgh.com/feed/", health: "healthy" },
    {
      name: "Pgh Business Times",
      url: "https://feeds.bizjournals.com/bizj/pittsburgh",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "2026-09-05: HTTP 403 bot-block on both the legacy and bizjournals.com URLs.",
    },
    {
      name: "TribLive Business",
      url: "https://triblive.com/business/feed/",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote:
        "2026-09-05: TribLive's section feeds return either an empty rss+xml document or an HTML shell depending on the request; only the root feed carries items.",
    },
  ],
  Sports: [
    { name: "Steelers.com", url: "https://www.steelers.com/rss/news", health: "healthy" },
    { name: "DK Pgh Sports", url: "https://dkpittsburghsports.com/feed", health: "healthy" },
    { name: "Post-Gazette Sports", url: "https://www.post-gazette.com/rss/sports", health: "healthy" },
    {
      name: "Penguins",
      url: "https://www.nhl.com/penguins/rss/news",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "2026-09-05: HTTP 200 serving text/html, not a feed.",
    },
    {
      name: "TribLive Sports",
      url: "https://triblive.com/sports/feed/",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "2026-09-05: empty rss+xml or HTML shell, same as TribLive Business. Only TribLive's root feed carries items.",
    },
  ],
  Culture: [
    {
      name: "Pittsburgh Mag",
      url: "https://www.pittsburghmagazine.com/category/arts-entertainment/feed/",
      health: "healthy",
    },
    {
      // Same path correction as the Top-section WESA feed above.
      name: "WESA Arts",
      url: "https://www.wesa.fm/arts-culture.rss",
      health: "healthy",
    },
    { name: "Post-Gazette A&E", url: "https://www.post-gazette.com/rss/ae", health: "healthy" },
    { name: "WQED", url: "https://www.wqed.org/feed", health: "healthy" },
    { name: "Table Magazine", url: "https://tablemagazine.com/feed/", health: "healthy" },
    {
      name: "City Paper",
      url: "https://www.pghcitypaper.com/pittsburgh/Rss.xml",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote:
        "2026-09-05: HTTP 403 bot-block (loads fine in a browser). Worth re-probing if the fetch headers change.",
    },
  ],
};
