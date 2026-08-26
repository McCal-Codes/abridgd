const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  eacute: "é",
  egrave: "è",
  ccedil: "ç",
  ntilde: "ñ",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
};

/**
 * Decodes numeric (decimal/hex) and common named HTML entities. Single shared
 * implementation used by both the feed parser and the full-content renderer, which
 * previously carried two separately hand-maintained, drifting entity lists.
 */
export const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;

  return text
    .replace(/&#(\d+);/g, (match, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return match;
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return match;
      }
    })
    .replace(/&([a-zA-Z]+);/g, (match, name) => {
      const key = name.toLowerCase();
      return key in NAMED_ENTITIES ? NAMED_ENTITIES[key] : match;
    });
};
