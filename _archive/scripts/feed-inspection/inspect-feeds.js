
const { XMLParser } = require('fast-xml-parser');

const feeds = {
  WTAE: 'https://www.wtae.com/topstories-rss',
  TribLive: 'https://triblive.com/feed/',
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

async function inspectFeeds() {
  for (const [category, url] of Object.entries(feeds)) {
    console.log(`\nTesting ${category}: ${url}`);
    try {
      const res = await fetch(url);
      const text = await res.text();
      const result = parser.parse(text);
      const channel = result.rss.channel;
      const items = channel.item;
      const first = items[0];
      
      console.log('Keys:', Object.keys(first));
      if (first.enclosure) console.log('Enclosure:', first.enclosure);
      if (first['media:content']) console.log('Media:', first['media:content']);
      if (first['media:thumbnail']) console.log('Thumbnail:', first['media:thumbnail']);
      
    } catch (e) {
      console.error('ERROR:', e.message);
    }
  }
}

inspectFeeds();
