import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { ScaleButton } from "./ScaleButton";

const { width, height } = Dimensions.get("window");

const HAPPY_PROMPTS = [
  {
    label: "Grateful thought",
    body: "Picture someone who made you laugh this week. Let that moment replay in your mind.",
  },
  {
    label: "Tiny joy",
    body: "Think of your favorite snack or drink. Imagine the first sip, the smell, the comfort.",
  },
  {
    label: "Safe place",
    body: "Visualize the coziest corner you know: soft blanket, warm light, slow breathing.",
  },
  {
    label: "Kindness",
    body: "Recall a compliment you received recently. Let it sink in and settle your shoulders.",
  },
];

interface GroundingOverlayProps {
  onClose: () => void;
  message?: string;
}

export const GroundingOverlay: React.FC<GroundingOverlayProps> = ({
  onClose,
  message = "Breathe.",
}) => {
  const { groundingColor, groundingBreathDuration, groundingCycles, showGroundingPrompts } =
    useSettings();
  const insets = useSafeAreaInsets();
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const sheetTranslate = useSharedValue(140);
  const promptOpacity = useSharedValue(1);
  const [instruction, setInstruction] = React.useState("Breathe.");
  const [promptIndex, setPromptIndex] = React.useState(0);

  useEffect(() => {
    // Use user's breath duration setting (in seconds, converted to ms)
    const breathDuration = groundingBreathDuration * 1000;
    const holdDuration = Math.floor(breathDuration * 0.5);
    const totalCycleDuration = breathDuration * 2 + holdDuration;

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: breathDuration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.2, { duration: holdDuration }),
        withTiming(0.95, { duration: breathDuration, easing: Easing.inOut(Easing.ease) }),
      ),
      groundingCycles,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: breathDuration }),
        withTiming(0.75, { duration: holdDuration }),
        withTiming(0.45, { duration: breathDuration }),
      ),
      groundingCycles,
    );

    const interval = setInterval(() => {
      setInstruction("Inhale...");
      setTimeout(() => setInstruction("Hold..."), breathDuration);
      setTimeout(() => setInstruction("Exhale..."), breathDuration + holdDuration);
    }, totalCycleDuration);

    const autoCloseTimer = setTimeout(
      () => {
        onClose();
      },
      totalCycleDuration * groundingCycles + 1000,
    );

    return () => {
      clearInterval(interval);
      clearTimeout(autoCloseTimer);
    };
  }, [groundingBreathDuration, groundingCycles]);

  useEffect(() => {
    sheetTranslate.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.exp) });
  }, [sheetTranslate]);

  useEffect(() => {
    promptOpacity.value = 0;
    promptOpacity.value = withTiming(1, { duration: 500 });
  }, [promptIndex, promptOpacity]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: glowOpacity.value,
    backgroundColor: (groundingColor || "#5BC7D4") + "22",
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslate.value }],
  }));

  const promptStyle = useAnimatedStyle(() => ({
    opacity: promptOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.backgroundBase} />
      <View style={styles.backgroundTint} />
      <Animated.View style={[styles.halo, haloStyle]} />

      <View style={styles.centerContent}>
        <Text style={styles.modeLabel}>Grounding Mode</Text>
        <Text style={styles.breatheText}>{instruction}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      <Animated.View
        style={[styles.dialogueSheet, sheetStyle, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        {showGroundingPrompts && (
          <Animated.View style={[styles.promptBubble, promptStyle]}>
            <Text style={styles.promptLabel}>{HAPPY_PROMPTS[promptIndex].label}</Text>
            <Text style={styles.promptText}>{HAPPY_PROMPTS[promptIndex].body}</Text>
          </Animated.View>
        )}
        <ScaleButton style={styles.sheetButton} onPress={onClose}>
          <Text style={styles.sheetButtonText}>I am ready to read</Text>
        </ScaleButton>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    overflow: "hidden",
  },
  halo: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    position: "absolute",
  },
  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#030712",
  },
  backgroundTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A1A2F",
    opacity: 0.85,
  },
  centerContent: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    flexGrow: 1,
    justifyContent: "center",
    marginTop: spacing.xl * 1.5,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  modeLabel: {
    fontFamily: typography.fontFamily.sans,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: spacing.xs,
  },
  breatheText: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 48,
    color: "#8DE1FF",
    letterSpacing: 0.5,
    lineHeight: 52,
  },
  message: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: width * 0.8,
    marginTop: spacing.xs,
  },
  dialogueSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(4,7,15,0.9)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  promptBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  promptLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  promptText: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 20,
    color: "#EAF6FF",
    lineHeight: 28,
  },
  promptHint: {
    fontFamily: typography.fontFamily.sans,
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  sheetButton: {
    paddingVertical: spacing.md,
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    alignItems: "center",
  },
  sheetButtonText: {
    fontFamily: typography.fontFamily.sans,
    color: "#0B1324",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});
