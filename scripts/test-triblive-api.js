
const PROXY = 'https://corsproxy.io/?';

async function testTribLiveApi() {
    console.log('Testing TribLive WP API...');
    
    // PGH Mag test
    const apiUrl = `https://www.pittsburghmagazine.com/wp-json/wp/v2/posts?per_page=1&_fields=title,content`;
    const proxyUrl = PROXY + encodeURIComponent(apiUrl);
    
    try {
        const res = await fetch(proxyUrl);
        if (!res.ok) {
            console.log('API Request Failed:', res.status);
            return;
        }
        
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            const post = data[0];
            console.log('API Success!');
            console.log('Title:', post.title.rendered);
            console.log('Link:', post.link);
            console.log('Content Length:', post.content.rendered.length);
            console.log('Content Start:', post.content.rendered.substring(0, 100));
        } else {
            console.log('No posts found via API');
        }
        
    } catch (e) {
        console.error('API Error:', e.message);
    }
}

testTribLiveApi();
