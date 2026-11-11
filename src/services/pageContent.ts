import type { HTMLElement } from "node-html-parser";

/** A real article body is long. Anything shorter than this is a teaser card, a caption block or a
 * wrapper around navigation, never the story. */
export const MIN_BODY_CHARS = 200;

const textLength = (node: HTMLElement): number => node.text.replace(/\s+/g, " ").trim().length;

/** Image URLs that are site chrome: logos, branding, avatars, icons, sprites, tracking pixels. */
export const NON_EDITORIAL_IMAGE =
  /(logo|brand|avatar|profile_photo|favicon|sprite|icon|badge|pixel|spacer|placeholder|default_image|\.svg(\?|$)|\.gif(\?|$))/i;

/** Page furniture that sits inside a story container but is not the story. */
const CHROME_ELEMENTS = "aside, nav, footer, form, iframe, button";
const CHROME_CLASS =
  /(related|recommend|promo|newsletter|trending|more-stor|read-more|also-read|share|social|author-(bio|photo|image)|byline|sponsor|advert|outbrain|taboola|teaser|most-(read|popular))/i;

/** A whole line that is page furniture rather than story: ad labels, update stamps, standards
 * links, job titles under a byline, infinite-scroll toggles. Matched against an entire block only. */
const BOILERPLATE_LINE =
  /^(advertisement|updated:?.{0,40}|published:?.{0,40}|editorial standards.{0,3}|infinite scroll enabled|share|digital content (manager|producer)|associated press)$/i;

/**
 * Removes what a publisher page wraps around the story: related-story cards with thumbnails,
 * share bars, newsletter prompts, author avatars and logos. The container the story lives in often
 * holds all of it, and it reached the reader as body text and "photos".
 */
export const stripPageChrome = (node: HTMLElement): void => {
  const total = textLength(node);
  node.querySelectorAll(CHROME_ELEMENTS).forEach((n) => n.remove());
  node.querySelectorAll("[class], [id]").forEach((n) => {
    const marker = `${n.getAttribute("class") ?? ""} ${n.getAttribute("id") ?? ""}`;
    // A class name is a hint, not proof: never remove a block that holds a large share of the
    // text, or a wrapper that happens to be called "share-wrapper" would blank the story.
    if (CHROME_CLASS.test(marker) && textLength(n) < total * 0.3) n.remove();
  });
  // The app shows the headline itself, so a page headline inside the body is always a repeat.
  node.querySelectorAll("h1").forEach((n) => n.remove());
  // Dateline and ad furniture: a block that is nothing but one of these lines.
  node.querySelectorAll("p, div, span, a, h2, h3, h4, label, li").forEach((n) => {
    if (n.querySelector("p, div, section, ul, li, img, figure")) return;
    if (BOILERPLATE_LINE.test(n.text.replace(/\s+/g, " ").trim())) n.remove();
  });
  const seenImages = new Set<string>();
  node.querySelectorAll("img").forEach((img) => {
    const src = `${img.getAttribute("src") ?? ""} ${img.getAttribute("data-src") ?? ""}`;
    if (NON_EDITORIAL_IMAGE.test(src)) {
      img.remove();
      return;
    }
    // The same photo is often embedded twice at different sizes (a lead image plus its
    // responsive copy). Same file once is enough.
    const key = (img.getAttribute("src") ?? "")
      .split(/[?#]/)[0]
      .toLowerCase()
      .replace(/-\d+x\d+(?=\.\w+$)/, "");
    if (!key) return;
    if (seenImages.has(key)) img.remove();
    else seenImages.add(key);
  });
};

/** Paragraphs shorter than this are labels, bylines or buttons, not prose. */
const PROSE_PARAGRAPH_CHARS = 60;

/**
 * Chooses the element that holds the story.
 *
 * 1. For each candidate selector in order, take the first *matching element that is article-sized*.
 *    Taking the first match, as before, picked a 28-character teaser card on the Allegheny Front
 *    (its pages carry seven `<article>` elements, the story is the last), so the reader showed an
 *    empty story.
 * 2. If no selector works, fall back to the block that holds the most prose: group the page's
 *    paragraphs by parent and pick the parent with the most text. This is what rescues pages whose
 *    markup the selector list has never seen (TribLive's pages have no `article` or `entry-content`).
 * 3. Otherwise there is no story to extract, and the caller keeps the feed's own text.
 */
export const selectContentNode = (root: HTMLElement, candidates: string[]): HTMLElement | null => {
  for (const selector of candidates) {
    let matches: HTMLElement[];
    try {
      matches = root.querySelectorAll(selector);
    } catch {
      continue; // selector unsupported by this parser version
    }
    const hit = matches.find((node) => textLength(node) >= MIN_BODY_CHARS);
    if (hit) return hit;
  }

  const byParent = new Map<HTMLElement, number>();
  for (const paragraph of root.querySelectorAll("p")) {
    const length = textLength(paragraph);
    const parent = paragraph.parentNode as HTMLElement | null;
    if (length < PROSE_PARAGRAPH_CHARS || !parent) continue;
    byParent.set(parent, (byParent.get(parent) ?? 0) + length);
  }

  let best: HTMLElement | null = null;
  let bestLength = 0;
  byParent.forEach((length, parent) => {
    if (length > bestLength) {
      best = parent;
      bestLength = length;
    }
  });
  return bestLength >= MIN_BODY_CHARS ? best : null;
};
