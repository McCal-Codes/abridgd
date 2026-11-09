import { Alert, Linking, Platform } from "react-native";
import { ResourceAction } from "./data";

/**
 * Hands a phone number or text message to the device.
 *
 * Only `tel:` and `sms:` links are ever built here, from the bundled resource list and nothing
 * else (never from feed content, which `openExternalUrl` handles and which is limited to http and
 * https). The number is checked to be digits before it goes into a link.
 */

const DIGITS = /^[0-9]{3,15}$/;

export const buildActionUrl = (action: ResourceAction): string | null => {
  if (!DIGITS.test(action.number)) return null;

  if (action.kind === "call") return `tel:${action.number}`;

  const body = action.body ? encodeURIComponent(action.body) : null;
  if (!body) return `sms:${action.number}`;
  // iOS separates the body with "&", Android with "?".
  return Platform.OS === "ios"
    ? `sms:${action.number}&body=${body}`
    : `sms:${action.number}?body=${body}`;
};

/** "Call" / "Text", or the entry's own label. */
export const actionLabel = (action: ResourceAction): string =>
  action.label ?? (action.kind === "call" ? "Call" : "Text");

/** Opens the dialer or messages app. If the device cannot (a tablet with no telephony), says so
 * and shows the number instead of doing nothing. */
export const performAction = async (
  action: ResourceAction,
  displayNumber: string,
): Promise<boolean> => {
  const url = buildActionUrl(action);
  const fallback = () =>
    Alert.alert(
      "Can't open the phone",
      action.kind === "text"
        ? `This device can't send texts from here. The number is ${displayNumber}.`
        : `This device can't place calls from here. The number is ${displayNumber}.`,
    );

  if (!url) {
    fallback();
    return false;
  }

  try {
    if (!(await Linking.canOpenURL(url))) {
      fallback();
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    fallback();
    return false;
  }
};
