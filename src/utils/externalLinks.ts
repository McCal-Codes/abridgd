import { Linking } from "react-native";

/** Web only. Article links and media URLs arrive as text inside third-party RSS, so they are
 * untrusted input: a hostile or compromised feed can put any scheme in a `<link>` element,
 * and `Linking.openURL` hands whatever it is to the system. `tel:` and `sms:` reach the
 * dialer, and a custom scheme opens whichever app claims it. Nothing this app does with a
 * feed URL needs anything but http(s). */
const ALLOWED_SCHEMES = ["http:", "https:"];

export const isSafeExternalUrl = (url?: string | null): boolean => {
  if (!url) return false;
  try {
    // React Native ships its own URL, not Node's. It implements `protocol` (returning "" when
    // the string has no scheme, which fails the check) but it does NOT throw on malformed
    // input the way Node does — except for a few shapes, which is why the catch stays.
    return ALLOWED_SCHEMES.includes(new URL(url.trim()).protocol);
  } catch {
    // Not parseable as an absolute URL, so there is nothing safe to open.
    return false;
  }
};

/**
 * Opens a URL that came from feed content, refusing any scheme outside http(s).
 *
 * Returns false when the link was rejected or could not be opened, so callers can tell the
 * reader rather than appearing to do nothing.
 */
export const openExternalUrl = async (url?: string | null): Promise<boolean> => {
  if (!isSafeExternalUrl(url)) {
    console.warn(`[externalLinks] Refused to open a non-web URL from feed content: ${url}`);
    return false;
  }

  try {
    // Open the original string, never the parsed URL's href: React Native's URL constructor
    // appends a trailing slash to any path that lacks one, which would rewrite article links.
    await Linking.openURL(url!.trim());
    return true;
  } catch (error) {
    console.warn(`[externalLinks] Failed to open ${url}`, error);
    return false;
  }
};
