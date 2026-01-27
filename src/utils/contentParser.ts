import { parse } from "node-html-parser";

interface ContentNode {
  type: "text" | "image" | "header" | "video";
  text?: string;
  src?: string;
  caption?: string;
  level?: string;
  poster?: string;
}

export const parseHtmlContent = (html: string): ContentNode[] => {
  if (!html) return [];

  // Basic cleanup before parsing
  let cleanHtml = html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");

  const root = parse(cleanHtml);
  const nodes: ContentNode[] = [];

  // fast-html-parser doesn't support query selectors like jQuery/cheerio
  // We need to traverse. A simple flat list traversal of children might miss nested images.
  // We'll do a recursive walk but flatten the "interesting" nodes into our list.

  const walk = (node: any) => {
    // fast-html-parser node structure: { tagName, attributes, childNodes, text }

    if (node.nodeType === 3) {
      // Text node
      const text = node.text;
      // If text is substantial, treat it as a paragraph substitute
      if (text && text.trim().length > 20) {
        nodes.push({ type: "text", text: decodeEntities(text.trim()) });
      }
      return;
    }

    if (!node.tagName) return;

    const tag = node.tagName.toLowerCase();

    if (tag === "img") {
      const src = node.attributes.src;
      if (src && !src.includes("pixel") && !src.includes("emoji")) {
        nodes.push({ type: "image", src });
      }
    } else if (tag === "figure") {
      const img = node.querySelector("img");
      const captionNode = node.querySelector("figcaption");

      if (img) {
        const src = img.attributes.src;
        const caption = captionNode ? captionNode.text : undefined;
        if (src) {
          nodes.push({ type: "image", src, caption });
        }
      }
    } else if (["h1", "h2", "h3", "h4"].includes(tag)) {
      const text = node.text || node.childNodes.map((torc: any) => torc.text).join("");
      if (text && text.trim()) {
        nodes.push({ type: "header", text: text.trim(), level: tag });
      }
    } else if (tag === "video") {
      // Look for <source> child first, otherwise src attr
      const sourceNode = node.querySelector("source");
      const src = sourceNode?.attributes?.src || node.attributes?.src;
      const poster = node.attributes?.poster;
      if (src) {
        nodes.push({ type: "video", src, poster });
      }
    } else if (tag === "iframe") {
      const src = node.attributes.src;
      if (src && /youtube\.com|youtu\.be|vimeo\.com|omny\.fm|libsyn\.com/.test(src)) {
        nodes.push({ type: "video", src });
      }
    } else if (["ul", "ol"].includes(tag)) {
      // Recurse into lists
      node.childNodes.forEach(walk);
    } else if (tag === "li") {
      const text = node.text || node.childNodes.map((c: any) => c.text).join("");
      if (text && text.trim().length > 0) {
        // Add a bullet point to list items
        nodes.push({ type: "text", text: "• " + decodeEntities(text.trim()) });
      }
    } else if (tag === "p") {
      // Collect all text from this paragraph
      // fast-html-parser's structured text might be better here to preserve line breaks?
      // Let's manually join children to preserve spacing if needed.

      // Also check if P contains an IMG (WordPress does this)
      const nestedImg = node.querySelector("img");
      if (nestedImg) {
        const src = nestedImg.attributes.src;
        if (src) nodes.push({ type: "image", src });
      }

      // Extract text content carefully
      // We want to handle <br> as newlines if possible, but fast-html-parser might convert them.
      const text = node.rawText || node.text;

      if (text && text.trim().length > 0) {
        nodes.push({ type: "text", text: decodeEntities(text.trim()) });
      }
    } else if (tag === "div") {
      // Just recurse for divs
      node.childNodes.forEach(walk);
    }
    // Generic recursion for other containers
    else {
      node.childNodes.forEach(walk);
    }
  };

  root.childNodes.forEach(walk);

  return nodes;
};

// fast-html-parser might not decode entities automatically in .text?
function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'") // Right single quote
    .replace(/&lsquo;/g, "'") // Left single quote
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&rdquo;/g, '"') // Right double quote
    .replace(/&ldquo;/g, '"') // Left double quote
    .replace(/&mdash;/g, "—") // Em dash
    .replace(/&ndash;/g, "–") // En dash
    .replace(/&hellip;/g, "...") // Ellipsis
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<");
}
