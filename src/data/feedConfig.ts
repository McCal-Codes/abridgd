import { ArticleCategory } from "../types/Article";

/** healthy: verified working. pending-replacement: verified broken, disabled until a working
 * replacement is sourced. experimental-off: opt-in/audio/niche feeds left off by default. */
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
    { name: "WTAE", url: "https://www.wtae.com/topstories-rss" },
    {
      name: "CBS Pittsburgh",
      url: "https://pittsburgh.cbslocal.com/feed/",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
    { name: "WPXI", url: "https://www.wpxi.com/arc/outboundfeeds/rss/?outputType=xml" },
    {
      name: "WESA",
      url: "https://www.wesa.fm/rss",
      defaultEnabled: false, // temporarily opt-out: endpoint returning 404 as of Jan 21, 2026
      health: "experimental-off",
    },
    {
      name: "Pittsburgh Independent",
      url: "https://pghindependent.com/feed/",
      defaultEnabled: false, // temporarily opt-out: endpoint returning 404 as of Jan 21, 2026
      health: "experimental-off",
    },
    {
      name: "Pittsburgh City Cast",
      url: "https://omny.fm/shows/city-cast-pittsburgh/playlists/podcast.rss",
      defaultEnabled: false,
      health: "experimental-off",
    },
  ],
  Local: [
    { name: "Public Source", url: "https://www.publicsource.org/feed/" },
    { name: "TribLive", url: "https://triblive.com/feed/" },
    { name: "Post-Gazette", url: "https://www.post-gazette.com/rss/local" },
    {
      name: "New Pittsburgh Courier",
      url: "https://newpittsburghcourier.com/feed/",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
    { name: "Kidsburgh", url: "https://www.kidsburgh.org/feed/" },
    {
      name: "Pittsburgh Mom Collective",
      url: "https://pittsburgh.momcollective.com/feed/",
      defaultEnabled: false,
      health: "experimental-off",
    },
    {
      name: "The Incline",
      url: "https://theincline.com/feed/",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
  ],
  Business: [
    {
      name: "Pgh Business Times",
      url: "http://feeds.bizjournals.com/bizj/pittsburgh",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
    {
      name: "TribLive Business",
      url: "https://triblive.com/business/feed/",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
    { name: "Post-Gazette Biz", url: "https://www.post-gazette.com/rss/business" },
    { name: "NEXTpittsburgh", url: "https://www.nextpittsburgh.com/feed/" },
    {
      name: "TechVibe Radio",
      url: "https://techviberadio.libsyn.com/rss",
      defaultEnabled: false,
      health: "experimental-off",
    },
    {
      name: "InnovatePGH",
      url: "https://pghtech.org/feed/",
      defaultEnabled: false,
      health: "experimental-off",
    },
  ],
  Sports: [
    { name: "Steelers.com", url: "https://www.steelers.com/rss/news" },
    { name: "DK Pgh Sports", url: "https://dkpittsburghsports.com/feed" },
    {
      name: "TribLive Sports",
      url: "https://triblive.com/sports/feed/",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
    {
      name: "Penguins",
      url: "https://www.nhl.com/penguins/rss/news",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
    {
      name: "Pirates",
      url: "https://www.mlb.com/pirates/feeds/news/rss",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
    {
      name: "Pitt Panthers",
      url: "https://pittsburghpanthers.com/rss.aspx?path=general",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
  ],
  Culture: [
    {
      name: "City Paper",
      url: "https://www.pghcitypaper.com/pittsburgh/Rss.xml",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
    {
      name: "Pittsburgh Mag",
      url: "https://www.pittsburghmagazine.com/category/arts-entertainment/feed/",
    },
    {
      name: "WESA Arts",
      url: "https://www.wesa.fm/arts-culture/rss",
      defaultEnabled: false,
      health: "pending-replacement",
      healthNote: "Non-feed response as of 2026-06-25 source health probe.",
    },
  ],
};
