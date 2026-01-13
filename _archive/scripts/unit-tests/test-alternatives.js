
const { XMLParser } = require('fast-xml-parser');

const feeds = {
  WTAE: 'https://www.wtae.com/topstories-rss',
  WPXI: 'https://www.wpxi.com/feeds/rss',
  TribLive: 'https://triblive.com/feed/',
  Steelers: 'https://www.steelers.com/rss/news'
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

async function testFeeds() {
  for (const [category, url] of Object.entries(feeds)) {
    console.log(`\nTesting ${category}: ${url}`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
          console.error(`FAILED request: ${res.status}`);
          continue;
      }
      const text = await res.text();
      // console.log(text.substring(0, 200)); 
      
      const result = parser.parse(text);
      const channel = result.rss ? result.rss.channel : result.feed;
      if (!channel) {
          console.error('FAILED to find channel/feed root');
          continue;
      }

      const items = channel.item || channel.entry || [];
      const itemsArray = Array.isArray(items) ? items : [items];

      console.log(`Creating ${itemsArray.length} items...`);
    } catch (e) {
      console.error('ERROR:', e.message);
    }
  }
}

testFeeds();
