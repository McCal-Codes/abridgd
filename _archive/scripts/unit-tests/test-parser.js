
const { parse } = require('fast-html-parser');

const html = `
<p>First paragraph with <strong>bold</strong> text.</p>
<div>
  <p>Second paragraph nested.</p>
  Text directly in div.
</div>
<p>Third paragraph with <img src="image.jpg" /> image inside.</p>
Just some loose text at the end.
`;

function testParser(html) {
    const root = parse(html);
    const nodes = [];

    const walk = (node) => {
        if (node.nodeType === 3) {
            const txt = node.text.trim();
            if (txt.length > 0) {
                console.log('Found loose text:', txt);
                nodes.push({ type: 'text', text: txt });
            }
            return;
        }
        
        const tag = node.tagName ? node.tagName.toLowerCase() : null;
        console.log('Visiting tag:', tag);

        if (tag === 'p') {
            console.log('Found P, text:', node.text);
            return;
        }
        
        if (node.childNodes) {
            node.childNodes.forEach(walk);
        }
    };

    root.childNodes.forEach(walk);
}

testParser(html);
