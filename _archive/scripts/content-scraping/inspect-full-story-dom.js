
const { parse } = require('fast-html-parser');

const TARGET_URL = 'https://www.wtae.com/article/pittsburgh-bridge-collapse-fern-hollow/38917277'; // Example
const PROXY = 'https://corsproxy.io/?';

async function inspectPage() {
    console.log('Fetching via proxy...');
    const res = await fetch(PROXY + encodeURIComponent(TARGET_URL));
    const html = await res.text();
    console.log(`Fetched ${html.length} chars`);
    
    const root = parse(html);
    
    // Heuristic: Find specific classes knowing typical news sites
    // WTAE (Hearst): usually .article-body or .article-content
    
    const candidates = [
        '.article-body',
        '.article-content',
        'article', 
        'main',
        '.entry-content',
        '#main-content'
    ];
    
    for (const selector of candidates) {
        const el = root.querySelector(selector);
        if (el) {
            console.log(`FOUND selector: ${selector}`);
            console.log('Text length:', el.text.trim().length);
            console.log('Preview:', el.text.trim().substring(0, 100));
            break; // Stop at first good match
        }
    }
}

inspectPage();
