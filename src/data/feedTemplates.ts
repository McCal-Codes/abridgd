import { ArticleCategory } from "../types/Article";
import { FeedSource } from "./feedConfig";

export type FeedTemplateFeed = FeedSource & {
  category: ArticleCategory;
  note?: string;
};

export type FeedTemplate = {
  id: string;
  label: string;
  description: string;
  location: "Pittsburgh" | "National" | "International";
  feeds: FeedTemplateFeed[];
};

export const FEED_TEMPLATES: FeedTemplate[] = [
  {
    id: "pittsburgh-local",
    label: "Pittsburgh",
    description: "Local-first mix of breaking, community, business, and sports.",
    location: "Pittsburgh",
    feeds: [
      { name: "WTAE", url: "https://www.wtae.com/topstories-rss", category: "Top" },
      { name: "TribLive", url: "https://triblive.com/feed/", category: "Local" },
      { name: "Public Source", url: "https://www.publicsource.org/feed/", category: "Local" },
      {
        name: "Post-Gazette Biz",
        url: "https://www.post-gazette.com/rss/business",
        category: "Business",
      },
      { name: "Steelers.com", url: "https://www.steelers.com/rss/news", category: "Sports" },
      {
        name: "City Paper",
        url: "https://www.pghcitypaper.com/pittsburgh/Rss.xml",
        category: "Culture",
      },
    ],
  },
  {
    id: "national-us",
    label: "National (US)",
    description: "Major US headlines across news, business, and sports.",
    location: "National",
    feeds: [
      {
        name: "AP Top Stories",
        url: "https://apnews.com/apf-topnews?output=atom",
        category: "Top",
      },
      {
        name: "Reuters Top News",
        url: "https://feeds.reuters.com/reuters/topNews",
        category: "Top",
      },
      { name: "NPR News", url: "https://feeds.npr.org/1001/rss.xml", category: "Top" },
      {
        name: "Reuters Business",
        url: "https://feeds.reuters.com/reuters/businessNews",
        category: "Business",
      },
      { name: "ESPN Headlines", url: "https://www.espn.com/espn/rss/news", category: "Sports" },
    ],
  },
  {
    id: "international-world",
    label: "International",
    description: "Global/world coverage plus culture highlights.",
    location: "International",
    feeds: [
      { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Top" },
      {
        name: "Reuters World",
        url: "https://feeds.reuters.com/Reuters/worldNews",
        category: "Top",
      },
      {
        name: "Al Jazeera English",
        url: "https://www.aljazeera.com/xml/rss/all.xml",
        category: "Top",
      },
      { name: "The Guardian World", url: "https://www.theguardian.com/world/rss", category: "Top" },
      {
        name: "NPR Arts & Culture",
        url: "https://feeds.npr.org/1008/rss.xml",
        category: "Culture",
      },
    ],
  },
];
