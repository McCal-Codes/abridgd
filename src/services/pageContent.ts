import type { HTMLElement } from "node-html-parser";

/** A real article body is long. Anything shorter than this is a teaser card, a caption block or a
 * wrapper around navigation, never the story. */
export const MIN_BODY_CHARS = 200;

const textLength = (node: HTMLElement): number => node.text.replace(/\s+/g, " ").trim().length;

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
