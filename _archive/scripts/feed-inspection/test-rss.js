
const { XMLParser } = require('fast-xml-parser');

const feeds = {
  Top: 'https://www.cbsnews.com/latest/rss/local/pittsburgh',
  Local: 'https://www.publicsource.org/feed/',
  Business: 'https://www.pittsburghmagazine.com/category/business/feed/',
  Sports: 'https://www.steelers.com/rss/news',
  Culture: 'https://www.pghcitypaper.com/pittsburgh/Rss.xml',
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

async function testFeeds() {
  for (const [category, url] of Object.entries(feeds)) {
    console.log(`\nTesting ${category}: ${url}`);
    try {
      // simulate the proxy behavior if possible, or just fetch direct since we are in node
      // Note: Node fetch works differently than browser fetch regarding CORS, so direct fetch usually works in Node.
      // But we want to check the PARSING logic.
      
      const res = await fetch(url);
      if (!res.ok) {
          console.error(`FAILED request: ${res.status}`);
          continue;
      }
      const text = await res.text();
      const result = parser.parse(text);

      const channel = result.rss ? result.rss.channel : result.feed;
      if (!channel) {
          console.error('FAILED to find channel/feed root');
          // console.log(text.substring(0, 500));
          continue;
      }

      const items = channel.item || channel.entry || [];
      const itemsArray = Array.isArray(items) ? items : [items];

      console.log(`Creating ${itemsArray.length} items...`);
      if (itemsArray.length > 0) {
          const first = itemsArray[0];
          console.log('Sample Item Keys:', Object.keys(first));
          console.log('Title:', first.title);
          console.log('Description:', (first.description || '').substring(0, 50));
          console.log('Content:', (first['content:encoded'] || first.content || '').substring(0, 50));
      } else {
          console.log('NO ITEMS FOUND');
      }

    } catch (e) {
      console.error('ERROR:', e.message);
    }
  }
}

testFeeds();
