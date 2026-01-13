
const { parse } = require('fast-html-parser');

const TEST_URLS = [
    { name: 'WTAE', url: 'https://www.wtae.com/article/pittsburgh-allegheny-county-pennsylvania-snow/46366558' }, // older working link example or generic
    { name: 'CityPaper', url: 'https://www.pghcitypaper.com/news/pittsburgh-city-council-approves-new-affordable-housing-trust-fund-25275850' }
];

const PROXY = 'https://corsproxy.io/?';

async function testScrapers() {
    for (const site of TEST_URLS) {
        console.log(`\nTesting ${site.name}...`);
        try {
            const res = await fetch(PROXY + encodeURIComponent(site.url), {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const html = await res.text();
            
            const root = parse(html);
            console.log(`Size: ${html.length}`);
            
            // Log body classes to guess
            const body = root.querySelector('body');
            // console.log('Body Classes:', body ? body.attributes.class : 'none');
            
            // Try identifying selectors
            const candidates = [
                '.article-body', '.article-content', '.entry-content', '#story-body', 
                '.story-body', 'main', 'article', '.ad-content-body'
            ];
            
            for (const sel of candidates) {
                const el = root.querySelector(sel);
                if (el) {
                    console.log(`[${site.name}] FOUND ${sel}`);
                    console.log(`Text Preview: ${el.text.trim().substring(0, 100)}`);
                    break;
                }
            }
        } catch(e) {
            console.error(e.message);
        }
    }
}

testScrapers();
