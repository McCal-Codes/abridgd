
const { XMLParser } = require('fast-xml-parser');

async function testProxy() {
  const feedUrl = 'https://www.wtae.com/topstories-rss';
  const proxyUrl = 'https://api.allorigins.win/raw?url=';
  // const proxyUrl = 'https://corsproxy.io/?';
  const finalUrl = proxyUrl + encodeURIComponent(feedUrl);

  console.log(`Testing Proxy: ${finalUrl}`);
  
  try {
      const res = await fetch(finalUrl);
      console.log(`Status: ${res.status}`);
      if (!res.ok) {
          console.error("Proxy returned error");
          return;
      }
      const text = await res.text();
      console.log(`Received ${text.length} chars`);
      console.log('Preview:', text.substring(0, 100));
  } catch (e) {
      console.error("Proxy Fetch Error:", e.message);
  }
}

testProxy();
