import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ScaleButton } from "./ScaleButton";

interface EmotionPickerProps {
  visible: boolean;
  onSelect: (emotion: "positive" | "neutral" | "negative") => void;
  onDismiss: () => void;
}

const EMOTIONS = [
  { value: "positive" as const, emoji: "😊", label: "This was helpful" },
  { value: "neutral" as const, emoji: "😐", label: "Neutral" },
  { value: "negative" as const, emoji: "😔", label: "Hard to read" },
];

export const EmotionPicker: React.FC<EmotionPickerProps> = ({ visible, onSelect, onDismiss }) => {
  const handleSelectEmotion = (emotion: "positive" | "neutral" | "negative") => {
    onSelect(emotion);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>How did this article make you feel?</Text>
          <Text style={styles.subtitle}>Your feedback helps us show you better content</Text>

          <View style={styles.emotionGrid}>
            {EMOTIONS.map((emotion) => (
              <TouchableOpacity
                key={emotion.value}
                style={styles.emotionButton}
                onPress={() => handleSelectEmotion(emotion.value)}
              >
                <Text style={styles.emoji}>{emotion.emoji}</Text>
                <Text style={styles.emotionLabel}>{emotion.label}</Text>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  container: {
    backgroundColor: "#fff",
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
    color: "#1a1a1a",
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: "#666",
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  emotionLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    color: "#666",
    textAlign: "center",
    maxWidth: 70,
  },
  skipButton: {
    marginTop: spacing.sm,
  },
  skipButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: "#666",
  },
});
