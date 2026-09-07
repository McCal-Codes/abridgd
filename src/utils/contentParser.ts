import { parse } from "node-html-parser";
import { decodeHtmlEntities } from "./htmlEntities";
import { isPhotoCredit, splitCaptionAndCredit } from "./photoCredit";

interface ContentNode {
  type: "text" | "image" | "header" | "video";
  text?: string;
  src?: string;
  caption?: string;
  /** Photo attribution, kept separate from the caption so it can be styled as a credit. */
  credit?: string;
  level?: string;
  poster?: string;
}

/** WordPress powers most of the feeds this app reads, and it emits captions as
 * `<div class="wp-caption"><img><p class="wp-caption-text">…</p></div>` rather than a
 * `<figure><figcaption>`. Matching only on figure meant losing captions on the majority
 * of sources. */
const WP_CAPTION_CLASS = /(^|\s)wp-caption(\s|$)/;
const CAPTION_TEXT_CLASS = /(caption-text|wp-caption-text|image-caption|photo-caption|credit)/i;

const captionFromNode = (node: any): string | undefined => {
  const text = node?.text;
  if (!text || !text.trim()) return undefined;
  return text.trim();
};

/** Builds an image node with caption and credit split apart. */
const buildImageNode = (src: string, rawCaption?: string): ContentNode => {
  const { caption, credit } = splitCaptionAndCredit(rawCaption);
  return { type: "image", src, caption, credit };
};

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
      const captionNode = node.querySelector("figcaption") || node.querySelector(".wp-caption-text");

      if (img) {
        const src = img.attributes.src;
        if (src) {
          nodes.push(buildImageNode(src, captionFromNode(captionNode)));
        }
      }
    } else if (["h1", "h2", "h3", "h4"].includes(tag)) {
      const text = node.text || node.childNodes.map((child: any) => child.text).join("");
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

      const className = node.attributes?.class || "";

      // A caption paragraph that follows its image (WordPress's `wp-caption-text`) belongs to
      // that image, not to the body copy.
      const previous = nodes[nodes.length - 1];
      if (CAPTION_TEXT_CLASS.test(className) && previous?.type === "image" && !previous.caption) {
        const { caption, credit } = splitCaptionAndCredit(node.text);
        previous.caption = caption;
        previous.credit = credit ?? previous.credit;
        return;
      }

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
      const className = node.attributes?.class || "";
      if (WP_CAPTION_CLASS.test(className)) {
        const img = node.querySelector("img");
        const captionNode =
          node.querySelector(".wp-caption-text") || node.querySelector("figcaption");
        if (img?.attributes?.src) {
          nodes.push(buildImageNode(img.attributes.src, captionFromNode(captionNode)));
          return; // consumed: don't also walk the img and caption as loose children
        }
      }
      node.childNodes.forEach(walk);
    }
    // Generic recursion for other containers
    else {
      node.childNodes.forEach(walk);
    }
  };

  root.childNodes.forEach(walk);

  return foldCreditsIntoImages(nodes);
};

/** Publishers routinely emit the attribution as a bare paragraph right after the image
 * ("AP Photo/Gene J. Puskar"). Rendering it as body copy stranded it from the photo it
 * belongs to, so attach it to the preceding image instead. */
const foldCreditsIntoImages = (nodes: ContentNode[]): ContentNode[] => {
  const folded: ContentNode[] = [];

  nodes.forEach((node) => {
    const previous = folded[folded.length - 1];
    if (
      node.type === "text" &&
      node.text &&
      previous?.type === "image" &&
      !previous.credit &&
      isPhotoCredit(node.text)
    ) {
      previous.credit = node.text.trim();
      return;
    }
    folded.push(node);
  });

  return folded;
};

// fast-html-parser might not decode entities automatically in .text?
function decodeEntities(text: string): string {
  return decodeHtmlEntities(text);
}
