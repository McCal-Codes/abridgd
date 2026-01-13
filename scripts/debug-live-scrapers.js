
const { parse } = require('fast-html-parser');
const { XMLParser } = require('fast-xml-parser');

const PROXY = 'https://corsproxy.io/?';
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const FEEDS = [
    { name: 'WTAE', url: 'https://www.wtae.com/topstories-rss' },
    { name: 'CityPaper', url: 'https://www.pghcitypaper.com/pittsburgh/Rss.xml' }
];

async function run() {
    for (const feed of FEEDS) {
        console.log(`\n--- Processing ${feed.name} ---`);
        try {
            // 1. Get Feed
            const feedRes = await fetch(PROXY + encodeURIComponent(feed.url));
            const feedText = await feedRes.text();
            const rss = xmlParser.parse(feedText);
            
            const item = rss.rss?.channel?.item?.[0] || rss.feed?.entry?.[0]; // Handle cases
            if (!item) { console.log('No items found'); continue; }
            
            const link = item.link;
            console.log(`Live Link: ${link}`);
            
            // 2. Fetch Page
            const pageRes = await fetch(PROXY + encodeURIComponent(link), {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const html = await pageRes.text();
            const root = parse(html);
            
            // 3. Hunt for Content
            // Updated candidates list
            const candidates = [
                '.article-body-content', 
                '.article-content', 
                '.entry-content', 
                '#story-body', 
                '.story-body', 
                'article',
                '.main-content'
            ];
            
            let found = false;
            for (const sel of candidates) {
                const el = root.querySelector(sel);
                if (el) {
                    console.log(`SUCCESS with selector: ${sel}`);
                    console.log(`Context: ${el.text.trim().substring(0, 100)}`);
                    found = true;
                    break;
                }
            }
            if (!found) console.log('FAILED to find content with known selectors');
            
        } catch (e) {
            console.error('Error:', e.message);
        }
    }
}

run();
