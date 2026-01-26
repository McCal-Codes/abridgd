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
    { name: "CBS Pittsburgh", url: "https://pittsburgh.cbslocal.com/feed/" },
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
    { name: "The Incline", url: "https://theincline.com/feed/" },
  ],
  Business: [
    { name: "Pgh Business Times", url: "http://feeds.bizjournals.com/bizj/pittsburgh" },
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
  ],
  Sports: [
    { name: "Steelers.com", url: "https://www.steelers.com/rss/news" },
    { name: "DK Pgh Sports", url: "https://dkpittsburghsports.com/feed" },
    { name: "TribLive Sports", url: "https://triblive.com/sports/feed/" },
    { name: "Penguins", url: "https://www.nhl.com/penguins/rss/news" },
    { name: "Pirates", url: "https://www.mlb.com/pirates/feeds/news/rss" },
    { name: "Pitt Panthers", url: "https://pittsburghpanthers.com/rss.aspx?path=general" },
  ],
  Culture: [
    { name: "City Paper", url: "https://www.pghcitypaper.com/pittsburgh/Rss.xml" },
    {
      name: "Pittsburgh Mag",
      url: "https://www.pittsburghmagazine.com/category/arts-entertainment/feed/",
    },
    { name: "WESA Arts", url: "https://www.wesa.fm/arts-culture/rss" },
  ],
};
