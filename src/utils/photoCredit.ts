import { decodeHtmlEntities } from "./htmlEntities";

/** Phrases that only ever introduce an attribution: "Photo:", "Credit —", "Courtesy of …",
 * "AP Photo/Gene J. Puskar". Nobody opens a news paragraph with these. */
const STRONG_LEADING_PATTERN =
  /^(?:(?:photo|credit|courtesy|image|illustration)s?\s*[:\-—–]|photos?\s+(?:by|courtesy)|photograph(?:ed)?\s+by|courtesy\s+of|submitted\s+photo|AP\s+Photo)/i;

/** Bare organisation names. These do introduce credits, but they also open ordinary sentences
 * — "Associated Press reporters spent six months..." — so they need the short-string bound. */
const WEAK_LEADING_PATTERN = /^(?:Getty\s+Images?|Associated\s+Press|Reuters)/i;

/** Wire-service and photographer names that identify a credit anywhere in a SHORT string.
 * Unanchored matching only makes sense for short strings: a full paragraph that happens to
 * mention the Associated Press is reporting, not an attribution. */
const INLINE_CREDIT_PATTERN =
  /\b(AP Photo|Getty Images?|Associated Press|Reuters|Photo by|Photograph by|Photo courtesy|Courtesy of|Submitted photo)\b/i;

/** Beyond this, a string is prose that mentions a wire service rather than a credit line. */
const MAX_INLINE_CREDIT_LENGTH = 60;

/** Even an explicit "Courtesy of ..." is prose past this length — newsrooms write "Courtesy of
 * the Heinz History Center, the exhibit runs through March...". Without a bound those
 * paragraphs were styled as credits, and the content parser deleted them outright. */
const MAX_LEADING_CREDIT_LENGTH = 120;

export const isPhotoCredit = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length <= MAX_LEADING_CREDIT_LENGTH && STRONG_LEADING_PATTERN.test(trimmed)) {
    return true;
  }
  if (trimmed.length > MAX_INLINE_CREDIT_LENGTH) return false;
  return WEAK_LEADING_PATTERN.test(trimmed) || INLINE_CREDIT_PATTERN.test(trimmed);
};

/** A trailing credit clause inside a caption: "…at the rally. (Photo: Jane Doe/AP)" or
 * "…at the rally. — AP Photo/Gene J. Puskar". Publishers split roughly half and half between
 * a separate credit element and a caption with the credit tacked on, so both paths matter. */
const TRAILING_CREDIT_PATTERN =
  /(?:\s*[—–-]\s*|\s*[\(\[])((?:photo|credit|courtesy|image)[^)\]]*|(?:AP Photo|Getty Images?|Associated Press|Reuters)[^)\]]*)[\)\]]?\s*$/i;

export interface CaptionAndCredit {
  caption?: string;
  credit?: string;
}

/** Splits a raw caption string into its descriptive part and its attribution part, decoding
 * entities on the way through. Returns the whole string as a credit when there's nothing but
 * an attribution, and as a caption when there's no attribution to find. */
export const splitCaptionAndCredit = (raw?: string | null): CaptionAndCredit => {
  const text = decodeHtmlEntities((raw ?? "").replace(/\s+/g, " ")).trim();
  if (!text) return {};

  // Try the split first: "Caption — Getty Images" is both, and testing the whole string for
  // credit-ness would swallow the caption along with it.
  const match = TRAILING_CREDIT_PATTERN.exec(text);
  if (match && match.index > 0) {
    const caption = text.slice(0, match.index).trim().replace(/[.,;:\s]+$/, "");
    const credit = match[1].trim().replace(/[)\]]+$/, "");
    if (caption && credit) return { caption, credit };
  }

  if (isPhotoCredit(text)) return { credit: text };

  return { caption: text };
};
