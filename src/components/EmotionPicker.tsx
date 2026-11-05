import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Frown, Meh, Smile } from "lucide-react-native";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { ScaleButton } from "./ScaleButton";

interface EmotionPickerProps {
  visible: boolean;
  onSelect: (emotion: "positive" | "neutral" | "negative") => void;
  onDismiss: () => void;
}

// Lucide icons rather than emoji: the app's rule is "Lucide only, no emojis" (AGENTS.md), and an
// emoji renders in whatever the platform's emoji font is, which differs a lot between devices.
const EMOTIONS = [
  { value: "positive" as const, Icon: Smile, label: "This was helpful" },
  { value: "neutral" as const, Icon: Meh, label: "Neutral" },
  { value: "negative" as const, Icon: Frown, label: "Hard to read" },
];

export const EmotionPicker: React.FC<EmotionPickerProps> = ({ visible, onSelect, onDismiss }) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);

  const handleSelectEmotion = (emotion: "positive" | "neutral" | "negative") => {
    onSelect(emotion);
    onDismiss();
  };

  return (
    // onRequestClose is required on Android; without it the hardware back
    // button does nothing and this prompt is a dead end unless the user finds
    // "Skip for now". statusBarTranslucent lets the dim backdrop cover the
    // status bar under edge-to-edge.
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>How did this article make you feel?</Text>
          <Text style={styles.subtitle}>Your feedback helps us show you better content</Text>

          <View style={styles.emotionGrid}>
            {EMOTIONS.map(({ value, Icon, label }) => (
              <TouchableOpacity
                key={value}
                style={styles.emotionButton}
                onPress={() => handleSelectEmotion(value)}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <Icon size={40} color={colors.tintStrong} strokeWidth={1.6} />
                <Text style={styles.emotionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScaleButton style={styles.skipButton} onPress={onDismiss}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </ScaleButton>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      maxWidth: 320,
      width: "100%",
    },
    title: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.lg,
      fontWeight: "700",
      marginBottom: spacing.sm,
      textAlign: "center",
      color: colors.label,
    },
    subtitle: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
      textAlign: "center",
    },
    emotionGrid: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: spacing.lg,
    },
    emotionButton: {
      alignItems: "center",
      gap: spacing.xs,
      minHeight: 44,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    emotionLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      textAlign: "center",
      maxWidth: 70,
    },
    skipButton: {
      marginTop: spacing.sm,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    skipButtonText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
    },
  });
