import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useSettings } from "../context/SettingsContext";
import { useThemeOptional } from "../theme/ThemeContext";

/** Light/dark pair for a color that has to be chosen per theme. */
export interface GlassTone {
  light: string;
  dark: string;
}

interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Requested blur strength. Ignored when transparency is reduced. */
  intensity?: number;
  /** Translucent wash painted over the blur. */
  tone?: GlassTone;
  /** Opaque color used when the blur is off — must be readable with no blur behind it. */
  opaqueTone?: GlassTone;
  pointerEvents?: ViewStyle["pointerEvents"];
  testID?: string;
}

/**
 * The single place blur is decided.
 *
 * Every glass surface in the app used to inline its own BlurView with its own intensity, tint
 * and hardcoded rgba fallback, and only the tab bar checked `reduceTransparency` — so the
 * accessibility setting shipped in 1.5.0 was honored by exactly one surface out of six. Routing
 * them all through here means turning Reduce Transparency on actually makes the app opaque.
 *
 * Apple's guidance is that depth conveys hierarchy but legibility wins; when a reader has asked
 * for less transparency, that is not a preference to average against the app's own blur setting.
 */
export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  intensity = 30,
  tone,
  opaqueTone,
  pointerEvents,
  testID,
}) => {
  const { isDark } = useThemeOptional();
  const { reduceTransparency } = useSettings();

  const pick = (value?: GlassTone) => (value ? (isDark ? value.dark : value.light) : undefined);

  // Both platforms. expo-blur does support Android — `experimentalBlurMethod` defaults to
  // 'none', so BlurView there renders as a tinted translucent surface rather than a real
  // blur, which is exactly what LiquidTabBar has been shipping on Android since the Android
  // pipeline landed. Gating this to iOS left every other glass surface flat while the tab bar
  // was translucent, on the platform the app had just started targeting.
  //
  // Turning on a real Android blur is a one-word change — experimentalBlurMethod=
  // "dimezisBlurView" — deliberately not made here: it is flagged experimental upstream and
  // has not been looked at on an Android device.
  const useBlur = !reduceTransparency;

  if (!useBlur) {
    const fallback = pick(opaqueTone) ?? pick(tone);
    return (
      <View
        testID={testID}
        pointerEvents={pointerEvents}
        style={[style, fallback ? { backgroundColor: fallback } : null]}
      >
        {children}
      </View>
    );
  }

  const wash = pick(tone);

  return (
    <BlurView
      testID={testID}
      pointerEvents={pointerEvents}
      intensity={intensity}
      tint={isDark ? "dark" : "light"}
      style={[style, wash ? { backgroundColor: wash } : null]}
    >
      {children}
    </BlurView>
  );
};
