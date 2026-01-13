
const { parse } = require('fast-html-parser');
const { XMLParser } = require('fast-xml-parser');

const RSS_URL = 'https://www.wtae.com/topstories-rss';
const PROXY = 'https://corsproxy.io/?';

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
});

async function run() {
    // 1. Get RSS Feed
    console.log('Fetching RSS...');
    const rssRes = await fetch(PROXY + encodeURIComponent(RSS_URL));
    const rssText = await rssRes.text();
    const rss = xmlParser.parse(rssText);
    const item = rss.rss.channel.item[0];
    
    if (!item) { console.log('No items'); return; }
    
    const link = item.link;
    console.log(`Target Link: ${link}`);
    
    // 2. Fetch Full Page
    console.log('Fetching Full Page...');
    const pageRes = await fetch(PROXY + encodeURIComponent(link));
    const html = await pageRes.text();
    console.log(`Page Size: ${html.length}`);
    
    const root = parse(html);
    
    // Common selectors for news sites
    const selectors = {
        'wtae.com': '.article-body-content, .article-content',
        'publicsource.org': '.entry-content, article',
        'pittsburghmagazine.com': '.entry-content',
        'steelers.com': '.nfl-c-article__body',
        'pghcitypaper.com': '#story-body, .story-body'
    };
    
    // Find matching domain logic
    let contentEl = null;
    const domain = Object.keys(selectors).find(d => link.includes(d));
    
    if (domain) {
        console.log(`Using selectors for ${domain}: ${selectors[domain]}`);
        const candidates = selectors[domain].split(',');
        for (const sel of candidates) {
            contentEl = root.querySelector(sel.trim());
            if (contentEl) {
                console.log(`Match found with: ${sel}`);
                break;
            }
        }
    } else {
        // Fallback
        contentEl = root.querySelector('article') || root.querySelector('main');
    }
    
    if (contentEl) {
        console.log('--- CONTENT PREVIEW ---');
        console.log(contentEl.structuredText ? contentEl.structuredText.substring(0, 200) : contentEl.text.substring(0, 200));
    } else {
        console.log('NO CONTENT FOUND');
        // console.log(html.substring(0, 500)); // Debug
    }
}

run();
