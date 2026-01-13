
import { ArticleCategory } from '../types/Article';

export type FeedSource = {
    name: string;
    url: string;
};

export const RSS_FEEDS: Record<ArticleCategory, FeedSource[]> = {
  Top: [
      { name: 'WTAE', url: 'https://www.wtae.com/topstories-rss' },
      { name: 'CBS Pittsburgh', url: 'https://pittsburgh.cbslocal.com/feed/' },
      { name: 'WPXI', url: 'https://www.wpxi.com/feeds/rss' }
  ],
  Local: [
      { name: 'Public Source', url: 'https://www.publicsource.org/feed/' },
      { name: 'TribLive', url: 'https://triblive.com/feed/' },
      { name: 'Post-Gazette', url: 'https://www.post-gazette.com/rss/local' },
      { name: 'New Pittsburgh Courier', url: 'https://newpittsburghcourier.com/feed/' }
  ],
  Business: [
      { name: 'Pgh Business Times', url: 'http://feeds.bizjournals.com/bizj/pittsburgh' },
      { name: 'TribLive Business', url: 'https://triblive.com/business/feed/' },
      { name: 'Post-Gazette Biz', url: 'https://www.post-gazette.com/rss/business' },
      { name: 'NEXTpittsburgh', url: 'https://www.nextpittsburgh.com/feed/' }
  ],
  Sports: [
      { name: 'Steelers.com', url: 'https://www.steelers.com/rss/news' },
      { name: 'DK Pgh Sports', url: 'https://dkpittsburghsports.com/feed' },
      { name: 'TribLive Sports', url: 'https://triblive.com/sports/feed/' }
  ],
  Culture: [
      { name: 'City Paper', url: 'https://www.pghcitypaper.com/pittsburgh/Rss.xml' },
      { name: 'Pittsburgh Mag', url: 'https://www.pittsburghmagazine.com/category/arts-entertainment/feed/' }
  ],
};
