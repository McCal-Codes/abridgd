
const { XMLParser } = require('fast-xml-parser');

const RSS_FEEDS = {
  Top: 'https://www.wtae.com/topstories-rss',
  Local: 'https://www.publicsource.org/feed/',
  Business: 'https://www.pittsburghmagazine.com/category/business/feed/',
  Sports: 'https://www.steelers.com/rss/news',
  Culture: 'https://www.pghcitypaper.com/pittsburgh/Rss.xml',
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

const sanitizeText = (text) => {
  if (!text) return '';
  if (typeof text !== 'string') {
      if (text['#text']) return text['#text'];
      return ''; 
  }
  let clean = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>?/gm, '') 
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'");

  return clean.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
};

const mapRssItemToArticle = (item, category, sourceName) => {
   try {
      const content = item['content:encoded'] || item.content || item.description || '';
      const bodyText = sanitizeText(content);
      const summaryText = sanitizeText(item.description || item.title || '');
      
      console.log(`[${category}] processing item: ${item.title?.substring(0,20)}... BodyLen: ${bodyText.length}`);
      return { headline: item.title };
   } catch (e) {
       console.error(`[${category}] Error mapping item`, e);
       return null;
   }
};

async function run() {
    for (const [category, feedUrl] of Object.entries(RSS_FEEDS)) {
        console.log(`\nFetching ${category} from ${feedUrl}...`);
        try {
            const response = await fetch(feedUrl);
            const text = await response.text();
            
            // console.log(`Received ${text.length} chars`);
            
            const result = parser.parse(text);
            const channel = result.rss ? result.rss.channel : result.feed;
            
            if (!channel) {
                console.error(`[${category}] No channel/feed found! Keys: ${Object.keys(result)}`);
                continue;
            }
            
            const items = channel.item || channel.entry || [];
            const itemsArray = Array.isArray(items) ? items : [items];
            
            console.log(`[${category}] Found ${itemsArray.length} items`);
            
            const sourceName = channel.title || category;
            itemsArray.slice(0, 3).forEach(item => mapRssItemToArticle(item, category, sourceName));
            
        } catch (e) {
            console.error(`[${category}] Log Error:`, e.message);
        }
    }
}

run();
