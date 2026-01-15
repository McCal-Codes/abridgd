
const { parse } = require('fast-html-parser');
const { XMLParser } = require('fast-xml-parser');
// WTAE
const PROXY = 'https://corsproxy.io/?';

// A known WTAE article (from the feed) that might be failing
// Usually they are at wtae.com/article/...
const TARGET_URL = 'https://www.wtae.com/article/pittsburgh-police-and-pennsylvania-state-police-on-scene-of-incident-in-citys-uptown-neighborhood/69984822'; 

async function debugWtae() {
    console.log(`Fetching ${TARGET_URL}...`);
    try {
        const pageRes = await fetch(PROXY + encodeURIComponent(TARGET_URL), {
             headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
        });
        const html = await pageRes.text();
        const root = parse(html);

        console.log(`Size: ${html.length}`);
        
        // Check for specific containers
        const rules = [
            '.article-content',
            '.article-body',
            '.article-body-content',
            'main',
            '.main-content'
        ];
        
        for (const sel of rules) {
            const el = root.querySelector(sel);
            if (el) {
                console.log(`FOUND ${sel}: ${el.text.trim().length} chars`);
                console.log(`Preview: ${el.text.trim().substring(0, 100)}`);
            } else {
                console.log(`MISSING ${sel}`);
            }
        }
        
    } catch (e) {
        console.error(e);
    }
}

debugWtae();
