
import { XMLParser } from 'fast-xml-parser';
import { Article, ArticleCategory } from '../types/Article';
import { RSS_FEEDS } from '../data/feedConfig';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

const calculateReadTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

const sanitizeText = (text: any): string => {
  if (!text) return '';
  if (typeof text !== 'string') {
      // fast-xml-parser might return an object if the tag has attributes/children
      // try to extract text content if it's a known structure, or just return empty
      return text['#text'] || ''; 
  }
  let clean = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>?/gm, '') // Strip remaining tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#039;/g, "'") // Fix common apostrophe issue
    .replace(/&#39;/g, "'")  // Alternate apostrophe
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<');

  // Normalize excessive newlines to a max of 2
  return clean.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
};

const mapRssItemToArticle = (item: any, category: ArticleCategory, sourceName: string): Article => {
  const content = item['content:encoded'] || item.content || item.description || '';
  // We now preserve the HTML in the body so the parser can handle images and structure
  // We still sanitize the summary for the card view
  const summaryText = sanitizeText(item.description || item.title || '');
  const headline = sanitizeText(item.title?.trim() || 'Untitled'); // Sanitize headline too!

  // Extract image from enclosure or media:content or itunes:image
  let imageUrl = undefined;
  if (item.enclosure && item.enclosure['@_url']) {
      imageUrl = item.enclosure['@_url'];
  } else if (item['media:content'] && item['media:content']['@_url']) {
      imageUrl = item['media:content']['@_url'];
  } else if (item['itunes:image'] && item['itunes:image']['@_href']) {
      imageUrl = item['itunes:image']['@_href'];
  }
  
  // Fallback: Try to find an image in the description or content
  if (!imageUrl) {
      // Look for images in figure tags first (usually captions/higher quality)
      const figureMatch = (content || item.description || '').match(/<figure[^>]*>.*?<img[^>]+src="([^">]+)".*?<\/figure>/s);
      
      if (figureMatch) {
          imageUrl = figureMatch[1];
      } else {
          // General image fallback
          const imgMatch = (content || item.description || '').match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) {
             const candidate = imgMatch[1];
             if (!candidate.includes('pixel') && !candidate.includes('emoji')) {
                 imageUrl = candidate;
             }
          }
      }
  }

  // Sanitize: ensure https
  if (imageUrl && imageUrl.startsWith('http:')) {
      imageUrl = imageUrl.replace('http:', 'https:');
  }

  // Extract GUID/ID as a string (it can sometimes be an object from fast-xml-parser)
  const extractId = (val: any): string | undefined => {
      if (!val) return undefined;
      if (typeof val === 'string') return val;
      return val['#text'] || val.toString();
  };

  const articleId = extractId(item.guid) || extractId(item.id) || extractId(item.link) || Math.random().toString(36).substring(2, 9);

  return {
    id: articleId,
    headline: headline,
    summary: summaryText.substring(0, 150) + (summaryText.length > 150 ? '...' : ''),
    body: content, // Pass RAW content
    source: sourceName,
    timestamp: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recently',
    publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
    category: category,
    imageUrl: imageUrl,
    readTimeMinutes: calculateReadTime(summaryText), // Approx
    isSensitive: false, 
    link: item.link
  };
};

export const fetchArticlesByCategory = async (category: ArticleCategory): Promise<Article[]> => {
  const feeds = RSS_FEEDS[category];
  
  // feeds is now an array of objects
  const feedSources = Array.isArray(feeds) ? feeds : [feeds];
  
  if (!feedSources || feedSources.length === 0) {
    console.warn(`No feed found for category: ${category}`);
    return [];
  }

  // Helper to fetch one feed
  // Now accepts the whole FeedSource object
  const fetchSingleFeed = async (source: { name: string, url: string }) => {
      try {
        console.log(`Fetching ${source.name} (${source.url})...`);
        const isWeb = true; 
        const proxyUrl = 'https://corsproxy.io/?';
        const finalUrl = proxyUrl + encodeURIComponent(source.url);

        const response = await fetch(isWeb ? finalUrl : source.url);
        if (!response.ok) return [];

        const text = await response.text();
        const result = parser.parse(text);
        
        const channel = result.rss ? result.rss.channel : result.feed;
        if (!channel) return [];

        const items = channel.item || channel.entry || [];
        const itemsArray = Array.isArray(items) ? items : [items];

        // Use the configured name, ignore the XML title which can be messy
        const sourceName = source.name;
        
        console.log(`Fetched ${itemsArray.length} items from ${sourceName}`);
        
        return itemsArray.map((item: any) => mapRssItemToArticle(item, category, sourceName));
      } catch (error) {
        console.error(`Error fetching/parsing ${source.url}:`, error);
        return [];
      }
  };

  // Fetch all concurrently
  const results = await Promise.all(feedSources.map(src => fetchSingleFeed(src)));
  
  // Flatten and separate into buckets for sorting
  const flatArticles = results.flat();
  
  const allArticles = flatArticles.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      
      const timeDiff = dateB - dateA; // Positive if B is newer
      
      // If articles are from "different times" (e.g. > 12 hours apart), strict time sort wins
      // We want breaking news to always be top.
      const TWELVE_HOURS = 12 * 60 * 60 * 1000;
      if (Math.abs(timeDiff) > TWELVE_HOURS) {
          return timeDiff;
      }
      
      // If within the same general news cycle, prefer articles with full content (longer body)
      const lenA = a.body.length;
      const lenB = b.body.length;
      
      // Define "Full Content" as substantial text (> 1000 chars)
      const isFullA = lenA > 1000;
      const isFullB = lenB > 1000;
      
      if (isFullA && !isFullB) return -1; // A comes first
      if (!isFullA && isFullB) return 1;  // B comes first
      
      // If both are full or both are summary, stick to time
      return timeDiff;
  });

  return allArticles;
};

export const fetchAllArticles = async (): Promise<Article[]> => {
  const categories = Object.keys(RSS_FEEDS) as ArticleCategory[];
  const results = await Promise.all(categories.map(cat => fetchArticlesByCategory(cat)));
  return results.flat();
};
