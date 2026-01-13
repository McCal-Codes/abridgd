
const { parse } = require('fast-html-parser');
const { XMLParser } = require('fast-xml-parser');

const FEED_URL = 'https://triblive.com/feed/';
const PROXY = 'https://corsproxy.io/?';

async function testTribLive() {
    console.log('Fetching TribLive Feed...');
    const feedRes = await fetch(PROXY + encodeURIComponent(FEED_URL));
    const feedText = await feedRes.text();
    
    const parser = new XMLParser();
    const rss = parser.parse(feedText);
    const item = rss?.rss?.channel?.item?.[0]; // Get first item
    
    if (!item) {
        console.log('No items found in feed');
        return;
    }
    
    const link = item.link;
    console.log(`Target Article: ${link}`);
    
    console.log('Fetching Full Article Page...');
    // AllOrigins returns JSON with 'contents' field
    const pageRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(link)}`);
    const data = await pageRes.json();
    const html = data.contents;
    console.log(`Page Size: ${html.length}`);
    console.log('HTML Start:', html.substring(0, 500));
    
    const root = parse(html);
    
    // Test known selectors
    const candidates = ['.entry-content', 'article', '.story-content', '.article-body'];
    
    for (const sel of candidates) {
        const el = root.querySelector(sel);
        if (el) {
            console.log(`\nMATCH FOUND: ${sel}`);
            console.log('Sample Text:', el.text.trim().substring(0, 200));
            // console.log('InnerHTML Preview:', el.innerHTML.substring(0, 200));
            break;
        }
    }
}

testTribLive();
