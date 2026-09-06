import { Alert, Linking } from "react-native";

/**
 * Opens a URL that came from feed content.
 *
 * Article links and embedded media srcs are third-party XML: whatever a publisher puts in
 * `<link>` reaches this unchanged. Nothing validated the scheme, so a feed emitting
 * `javascript:` or a custom `intent://` scheme was handed straight to Linking.openURL. On
 * native that is mostly an app-launch attempt or a rejected promise; on web - a supported
 * target here - RN-Web routes openURL to window.open, where `javascript:` executes.
 *
 * Only http and https are opened. Anything else is refused rather than passed through,
 * and failures surface as a message instead of an unhandled promise rejection, which is
 * what both previous call sites produced.
 */
const ALLOWED_SCHEMES = ["http:", "https:"];

export const isSafeExternalUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const trimmed = String(url).trim();
  if (!trimmed) return false;

  // Deliberately a prefix test rather than a URL parse: React Native's URL polyfill is
  // lenient, and a scheme check is the whole point here.
  const scheme = trimmed.match(/^([a-z][a-z0-9+.-]*:)/i)?.[1]?.toLowerCase();

  // A bare or protocol-relative URL has no scheme to distrust; treat it as relative and
  // refuse it, since callers here always deal in absolute article URLs.
  if (!scheme) return false;

  return ALLOWED_SCHEMES.includes(scheme);
};

export const openExternalUrl = async (url?: string | null): Promise<boolean> => {
  if (!isSafeExternalUrl(url)) {
    Alert.alert("Can't open link", "This link isn't a valid web address.");
    return false;
  }

  try {
    await Linking.openURL(String(url).trim());
    return true;
  } catch {
    Alert.alert("Can't open link", "Nothing on this device could open that link.");
    return false;
  }
};
