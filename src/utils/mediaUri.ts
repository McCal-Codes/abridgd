/** Origin of an absolute http(s) URL, e.g. "https://www.post-gazette.com". */
const originOf = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  const match = /^(https?:\/\/[^/?#]+)/i.exec(url.trim());
  return match ? match[1].replace(/^http:/i, "https:") : undefined;
};

/**
 * Resolves a media `src` taken from feed HTML into something an <Image> can load.
 *
 * Feed bodies carry every URL shape: absolute, protocol-relative, root-relative, and inline
 * data URIs. The previous inline helper prefixed anything not starting with "http" with
 * "https:", which turned "/images/a.jpg" into "https:/images/a.jpg" and mangled data URIs —
 * both of which loaded as nothing and rendered the "Image unavailable" placeholder.
 *
 * Relative paths resolve against the article's own link, which is what the publisher meant.
 *
 * Deliberately string-based: React Native's URL constructor appends a trailing slash to any
 * path lacking one, so `new URL(src, base).href` would corrupt every resolved media path.
 */
export const resolveMediaUri = (src?: string | null, articleLink?: string | null): string | undefined => {
  const raw = src?.trim();
  if (!raw) return undefined;

  // Inline images are already complete; touching them only breaks them.
  if (/^data:/i.test(raw)) return raw;

  if (/^https:\/\//i.test(raw)) return raw;
  if (/^http:\/\//i.test(raw)) return raw.replace(/^http:/i, "https:");

  // Protocol-relative: "//cdn.example.com/a.jpg"
  if (raw.startsWith("//")) return `https:${raw}`;

  const origin = originOf(articleLink);
  if (!origin) return undefined; // relative path with nothing to resolve against

  if (raw.startsWith("/")) return `${origin}${raw}`;
  return `${origin}/${raw.replace(/^\.\//, "")}`;
};
