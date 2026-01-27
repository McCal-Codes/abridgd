import { ArticleCategory } from "../types/Article";

export type FeedSource = {
  name: string;
  url: string;
  /** Optional default toggle. Defaults to true if omitted. */
  defaultEnabled?: boolean;
};

export const RSS_FEEDS: Record<ArticleCategory, FeedSource[]> = {
  Top: [
    { name: "WTAE", url: "https://www.wtae.com/topstories-rss" },
    { name: "AP Top Stories", url: "https://apnews.com/apf-topnews?output=atom" },
    {
      name: "Reuters Top News",
      url: "https://feeds.reuters.com/reuters/topNews",
      defaultEnabled: false, // DataDome now blocks anonymous requests (403 as of Jan 26, 2026)
    },
    {
      name: "BBC World",
      url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    },
    { name: "NPR News", url: "https://feeds.npr.org/1001/rss.xml" },
    {
      name: "CBS Pittsburgh",
      url: "https://www.cbsnews.com/latest/rss/pittsburgh",
      defaultEnabled: false, // legacy feed now redirects/empty; keep disabled until CBS restores items
    },
    { name: "WPXI", url: "https://www.wpxi.com/arc/outboundfeeds/rss/?outputType=xml" },
    {
      name: "WESA",
      url: "https://www.wesa.fm/rss",
      defaultEnabled: false, // temporarily opt-out: endpoint returning 404 as of Jan 21, 2026
    },
    {
      name: "Pittsburgh Independent",
      url: "https://pghindependent.com/feed/",
      defaultEnabled: false, // temporarily opt-out: endpoint returning 404 as of Jan 21, 2026
    },
    {
      name: "Pittsburgh City Cast",
      url: "https://omny.fm/shows/city-cast-pittsburgh/playlists/podcast.rss",
      defaultEnabled: false,
    },
  ],
  Local: [
    { name: "Public Source", url: "https://www.publicsource.org/feed/" },
    { name: "TribLive", url: "https://triblive.com/feed/" },
    { name: "Post-Gazette", url: "https://www.post-gazette.com/rss/local" },
    { name: "New Pittsburgh Courier", url: "https://newpittsburghcourier.com/feed/" },
    { name: "Kidsburgh", url: "https://www.kidsburgh.org/feed/" },
    {
      name: "Pittsburgh Mom Collective",
      url: "https://pittsburgh.momcollective.com/feed/",
      defaultEnabled: false,
    },
    {
      name: "PA Capital-Star",
      url: "https://penncapital-star.com/feed/",
    },
    {
      name: "The Incline",
      url: "https://theincline.com/feed/",
      defaultEnabled: false, // domain expired/parking page as of Jan 26, 2026
    },
  ],
  Business: [
    {
      name: "Pgh Business Times",
      url: "https://feeds.bizjournals.com/bizj/pittsburgh",
      defaultEnabled: false, // returning 403; keep optional for users with access
    },
    { name: "TribLive Business", url: "https://triblive.com/business/feed/" },
    { name: "Post-Gazette Biz", url: "https://www.post-gazette.com/rss/business" },
    { name: "NEXTpittsburgh", url: "https://www.nextpittsburgh.com/feed/" },
    {
      name: "TechVibe Radio",
      url: "https://techviberadio.libsyn.com/rss",
      defaultEnabled: false,
    },
    {
      name: "InnovatePGH",
      url: "https://pghtech.org/feed/",
      defaultEnabled: false,
    },
    {
      name: "Morning Brew",
      url: "https://www.morningbrew.com/feed",
      defaultEnabled: false, // optional national business context; enable manually
    },
  ],
  Sports: [
    { name: "Steelers.com", url: "https://www.steelers.com/rss/news" },
    { name: "DK Pgh Sports", url: "https://dkpittsburghsports.com/feed" },
    { name: "TribLive Sports", url: "https://triblive.com/sports/feed/" },
    {
      name: "Penguins",
      url: "https://www.nhl.com/penguins/rss/news",
      defaultEnabled: false, // NHL feed returning 403/error pages as of Jan 26, 2026
    },
    {
      name: "Pirates",
      url: "https://www.mlb.com/feeds/news/rss.xml?teamId=134",
      defaultEnabled: false, // MLB endpoint change; enable manually if acceptable (team-filtered)
    },
    {
      name: "Pitt Panthers",
      url: "https://pittsburghpanthers.com/rss.aspx?path=general",
      defaultEnabled: false, // intermittently 500/blocked; keep optional
    },
    {
      name: "ESPN Pittsburgh",
      url: "https://www.espn.com/espn/rss/pgh/news",
      defaultEnabled: false, // ESPN geo feeds can redirect; enable if stable for user
    },
  ],
  Culture: [
    { name: "City Paper", url: "https://www.pghcitypaper.com/pittsburgh/Rss.xml" },
    {
      name: "Pittsburgh Mag",
      url: "https://www.pittsburghmagazine.com/category/arts-entertainment/feed/",
    },
    {
      name: "WESA Arts",
      url: "https://www.wesa.fm/arts-culture/rss",
      defaultEnabled: false, // 404 as of Jan 26, 2026
    },
  ],
};
