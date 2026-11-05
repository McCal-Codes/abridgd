import * as ExpoHaptics from "expo-haptics";

/**
 * The app's haptics, honouring the Haptics setting.
 *
 * `hapticIntensity` ("off" | "subtle" | "normal" | "strong") existed in settings and in the
 * Accessibility screen, but about 25 call sites went straight to expo-haptics and never read it,
 * so choosing "off" changed nothing. Everything now imports this module instead, which exposes the
 * same names as expo-haptics. SettingsProvider keeps the level current through `configureHaptics`.
 */

export type HapticLevel = "off" | "subtle" | "normal" | "strong";

let level: HapticLevel = "normal";

export const configureHaptics = (next: HapticLevel): void => {
  level = next;
};

export const getHapticLevel = (): HapticLevel => level;

export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;

const STYLE_ORDER = ["Light", "Medium", "Heavy"] as const;

/** One step lighter for "subtle", one step heavier for "strong"; never past either end. */
const shiftStyle = (style: ExpoHaptics.ImpactFeedbackStyle, by: -1 | 0 | 1) => {
  if (by === 0 || !ExpoHaptics.ImpactFeedbackStyle) return style;
  const names = STYLE_ORDER.filter((name) => ExpoHaptics.ImpactFeedbackStyle[name] !== undefined);
  const index = names.findIndex((name) => ExpoHaptics.ImpactFeedbackStyle[name] === style);
  if (index === -1) return style;
  const next = Math.min(names.length - 1, Math.max(0, index + by));
  return ExpoHaptics.ImpactFeedbackStyle[names[next]];
};

export const impactAsync = async (
  style: ExpoHaptics.ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle?.Medium,
): Promise<void> => {
  if (level === "off") return;
  await ExpoHaptics.impactAsync(shiftStyle(style, level === "subtle" ? -1 : level === "strong" ? 1 : 0));
};

export const selectionAsync = async (): Promise<void> => {
  if (level === "off") return;
  await ExpoHaptics.selectionAsync();
};

export const notificationAsync = async (
  type: ExpoHaptics.NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType?.Success,
): Promise<void> => {
  if (level === "off") return;
  // A notification buzz is the most noticeable haptic; "subtle" downgrades it to a light tap.
  if (level === "subtle") {
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle?.Light);
    return;
  }
  await ExpoHaptics.notificationAsync(type);
};
