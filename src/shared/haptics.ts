import * as Haptics from "expo-haptics";
import { HapticIntensity } from "../context/SettingsContext";

type HapticType = "success" | "warning";

export const triggerHaptic = async (
  type: HapticType,
  hapticIntensity: HapticIntensity,
  reduceMotion: boolean,
) => {
  if (reduceMotion || hapticIntensity === "off") return;
  try {
    if (type === "warning") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const style =
      hapticIntensity === "strong"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : hapticIntensity === "subtle"
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium;
    await Haptics.impactAsync(style);
  } catch {
    // best-effort; ignore if haptics unavailable
  }
};
