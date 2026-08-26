import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { useSettings } from "../context/SettingsContext";

/**
 * Tracks the OS-level "Reduce Motion" accessibility preference so decorative animations
 * (springs, repeating pulses) can be skipped or made instant for users who've opted out of
 * motion, per WCAG 2.2.2 (Pause, Stop, Hide) and Apple's Reduce Motion guidance. Combined
 * with SettingsContext's in-app override, since a reader can enable Reduce Motion in the
 * app's own Accessibility settings without touching the OS-level preference.
 */
export const useReduceMotion = (): boolean => {
  const [osReduceMotion, setOsReduceMotion] = useState(false);
  const { reduceMotion: settingsReduceMotion } = useSettings();

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setOsReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setOsReduceMotion);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return osReduceMotion || settingsReduceMotion;
};
