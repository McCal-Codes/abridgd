import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import {
  useSettings,
  GroundingAnimationStyle,
  SensitivePromptLevel,
  SensitiveActionPreference,
  SensitiveTone,
} from "../context/SettingsContext";
import { useThemedStyles } from "../theme/useThemedStyles";

const GROUNDING_COLORS = ["#A8C3B3", "#D8BFD8", "#B0C4DE", "#F5DEB3", "#D3D3D3"];

const ANIMATION_STYLES: { label: string; value: GroundingAnimationStyle; description: string }[] = [
  { label: "Simple", value: "simple", description: "Single breathing circle." },
  { label: "Waves", value: "waves", description: "Dual circles with wave effect." },
  { label: "Pulse", value: "pulse", description: "Pulsing with glow effect." },
];

export const GroundingFocusSettingsScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const {
    isGroundingEnabled,
    setIsGroundingEnabled,
    showGroundingPrompts,
    setShowGroundingPrompts,
    groundingColor,
    setGroundingColor,
    groundingBreathDuration,
    setGroundingBreathDuration,
    groundingCycles,
    setGroundingCycles,
    groundingAnimationStyle,
    setGroundingAnimationStyle,
    sensitivePromptLevel,
    setSensitivePromptLevel,
    sensitiveActionPreference,
    setSensitiveActionPreference,
    sensitiveTone,
    setSensitiveTone,
  } = useSettings();

  const promptOptions: Array<{ label: string; value: SensitivePromptLevel; description: string }> =
    [
      { label: "Full", value: "full", description: "Guidance + breathing" },
      { label: "Minimal", value: "minimal", description: "Short reminder" },
      { label: "Off", value: "off", description: "Skip prompts" },
    ];

  const actionOptions: Array<{
    label: string;
    value: SensitiveActionPreference;
    description: string;
  }> = [
    { label: "Ground First", value: "ground-first", description: "Breath is primary" },
    { label: "Decide Each Time", value: "decide", description: "Show both equally" },
    { label: "Continue", value: "continue", description: "Skip to article" },
  ];

  const toneOptions: Array<{ label: string; value: SensitiveTone; description: string }> = [
    { label: "Gentle", value: "gentle", description: "Warm encouragement" },
    { label: "Direct", value: "direct", description: "Straightforward" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Grounding & Focus</Text>
        <Text style={styles.description}>
          Calming tools for intense content. Keep the tone gentle and predictable.
        </Text>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Grounding</Text>
              <Text style={styles.toggleDesc}>Enable breathing exercises for sensitive moments.</Text>
            </View>
            <Switch
              value={isGroundingEnabled}
              onValueChange={setIsGroundingEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Grounding Prompts</Text>
              <Text style={styles.toggleDesc}>Show gentle guidance during breaths.</Text>
            </View>
            <Switch
              value={showGroundingPrompts}
              onValueChange={setShowGroundingPrompts}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sensitive Content Personalization</Text>
          <Text style={styles.sectionDesc}>Decide how guidance feels when grounding is active.</Text>

          <Text style={styles.subsectionLabel}>Prompt Level</Text>
          <View style={styles.chipRow}>
            {promptOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.chip, sensitivePromptLevel === option.value && styles.chipSelected]}
                onPress={() => setSensitivePromptLevel(option.value)}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    sensitivePromptLevel === option.value && styles.chipLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.chipDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subsectionLabel}>Default Action</Text>
          <View style={styles.chipRow}>
            {actionOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  sensitiveActionPreference === option.value && styles.chipSelected,
                ]}
                onPress={() => setSensitiveActionPreference(option.value)}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    sensitiveActionPreference === option.value && styles.chipLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.chipDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subsectionLabel}>Tone</Text>
          <View style={styles.chipRow}>
            {toneOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  sensitiveTone === option.value && styles.chipSelected,
                  { flex: 1 },
                ]}
                onPress={() => setSensitiveTone(option.value)}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    sensitiveTone === option.value && styles.chipLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.chipDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grounding Color</Text>
          <Text style={styles.sectionDesc}>Choose the color for the breathing animation.</Text>
          <View style={styles.colorRow}>
            {GROUNDING_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  groundingColor === c && styles.selectedColor,
                ]}
                onPress={() => setGroundingColor(c)}
                accessibilityRole="button"
                accessibilityLabel={`Grounding color ${c}`}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breath Duration</Text>
          <Text style={styles.sectionDesc}>How long each breath cycle takes.</Text>
          <View style={styles.optionRow}>
            {[4, 5, 6, 7, 8].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.pill,
                  groundingBreathDuration === duration && styles.pillSelected,
                ]}
                onPress={() => setGroundingBreathDuration(duration)}
              >
                <Text
                  style={[
                    styles.pillText,
                    groundingBreathDuration === duration && styles.pillTextSelected,
                  ]}
                >
                  {duration}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Breath Cycles</Text>
          <Text style={styles.sectionDesc}>How many cycles to complete.</Text>
          <View style={styles.optionRow}>
            {[3, 5, 7, 10].map((cycles) => (
              <TouchableOpacity
                key={cycles}
                style={[styles.pill, groundingCycles === cycles && styles.pillSelected]}
                onPress={() => setGroundingCycles(cycles)}
              >
                <Text
                  style={[styles.pillText, groundingCycles === cycles && styles.pillTextSelected]}
                >
                  {cycles}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animation Style</Text>
          <View style={styles.cardList}>
            {ANIMATION_STYLES.map((style) => (
              <TouchableOpacity
                key={style.value}
                style={[
                  styles.card,
                  groundingAnimationStyle === style.value && styles.cardSelected,
                ]}
                onPress={() => setGroundingAnimationStyle(style.value)}
              >
                <Text
                  style={[
                    styles.cardLabel,
                    groundingAnimationStyle === style.value && styles.cardLabelSelected,
                  ]}
                >
                  {style.label}
                </Text>
                <Text style={styles.cardDesc}>{style.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewHint}>Grounding preview placeholder (animation hook).</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
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
  colorRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedColor: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  optionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 60,
    alignItems: "center",
  },
  pillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.tintTransparent,
  },
  pillText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  pillTextSelected: {
    color: colors.primary,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  chip: {
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.tintTransparent,
  },
  chipLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipLabelSelected: {
    color: colors.primary,
  },
  chipDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  subsectionLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardList: {
    gap: spacing.sm,
  },
  card: {
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.tintTransparent,
  },
  cardLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  cardLabelSelected: {
    color: colors.primary,
  },
  cardDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  previewBox: {
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  previewHint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  });
