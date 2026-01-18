import React from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useSettings } from "../context/SettingsContext";
import { AbridgedReader } from "../components/AbridgedReader";

export const ReadingSettingsScreen: React.FC = () => {
  const {
    isReaderEnabled,
    setIsReaderEnabled,
    isGroundingEnabled,
    setIsGroundingEnabled,
    isSummarizationEnabled,
    setIsSummarizationEnabled,
    readingSpeed,
    setReadingSpeed,
    fontSize,
    setFontSize,
    autoSaveOnComplete,
    setAutoSaveOnComplete,
  } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Reading Features</Text>
        <Text style={styles.description}>Customize how you read and interact with articles.</Text>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Abridged Reader</Text>
              <Text style={styles.toggleDesc}>
                Rapid Serial Visual Presentation mode for faster reading.
              </Text>
            </View>
            <Switch
              value={isReaderEnabled}
              onValueChange={setIsReaderEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>AI Summarization</Text>
              <Text style={styles.toggleDesc}>
                Automatically generate concise summaries of articles.
              </Text>
            </View>
            <Switch
              value={isSummarizationEnabled}
              onValueChange={setIsSummarizationEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Grounding Mode</Text>
              <Text style={styles.toggleDesc}>Breathing exercises for sensitive content.</Text>
            </View>
            <Switch
              value={isGroundingEnabled}
              onValueChange={setIsGroundingEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Auto-Save on Completion</Text>
              <Text style={styles.toggleDesc}>
                Automatically save articles when read to the end in RSVP mode.
              </Text>
            </View>
            <Switch
              value={autoSaveOnComplete}
              onValueChange={setAutoSaveOnComplete}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Speed</Text>
          <Text style={styles.sectionDesc}>Words per minute for RSVP reader</Text>
          <View style={styles.speedRow}>
            {[200, 250, 300, 350, 400, 450, 500].map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[styles.speedOption, readingSpeed === speed && styles.selectedSpeed]}
                onPress={() => setReadingSpeed(speed)}
              >
                <Text
                  style={[styles.speedText, readingSpeed === speed && styles.selectedSpeedText]}
                >
                  {speed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font Size</Text>
          <Text style={styles.sectionDesc}>Adjust article text size</Text>
          <View style={styles.fontRow}>
            {[
              { label: "Small", value: 0.85 },
              { label: "Normal", value: 1.0 },
              { label: "Large", value: 1.15 },
              { label: "X-Large", value: 1.3 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.fontOption, fontSize === option.value && styles.selectedFont]}
                onPress={() => setFontSize(option.value)}
              >
                <Text
                  style={[styles.fontText, fontSize === option.value && styles.selectedFontText]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reader Preview</Text>
          <AbridgedReader content="I hope you are having a wonderful day, and by the way, I truly believe that almost anything tastes better when it is served as chicken on a stick." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: 150,
  },
  header: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  toggleLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  toggleDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  speedRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  speedOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 50,
    alignItems: "center",
  },
  selectedSpeed: {
    borderColor: colors.primary,
    backgroundColor: "#F0F4F8",
  },
  speedText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  selectedSpeedText: {
    color: colors.primary,
  },
  fontRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  fontOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    minWidth: 70,
  },
  selectedFont: {
    borderColor: colors.primary,
    backgroundColor: "#F0F4F8",
  },
  fontText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  selectedFontText: {
    color: colors.primary,
  },
});
