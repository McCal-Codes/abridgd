import React from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useSettings } from "../context/SettingsContext";
import { Clock, Volume2 } from "lucide-react-native";
import { useThemedStyles } from "../theme/useThemedStyles";

export const AccessibilitySettingsScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const {
    animationsEnabled,
    setAnimationsEnabled,
    reduceMotion,
    setReduceMotion,
    animationScale,
    setAnimationScale,
    hapticIntensity,
    setHapticIntensity,
    quietHoursEnabled,
    setQuietHoursEnabled,
    quietHoursStart,
    setQuietHoursStart,
    quietHoursEnd,
    setQuietHoursEnd,
  } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Accessibility</Text>
        <Text style={styles.description}>
          Controls that help the app adapt to motion sensitivity and pacing. Accessibility wins over
          visual flourish when these conflict.
        </Text>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Reduce Motion</Text>
              <Text style={styles.toggleDesc}>Limit animations for motion-sensitive users.</Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Enable Animations</Text>
              <Text style={styles.toggleDesc}>Turn off to keep the experience static.</Text>
            </View>
            <Switch
              value={animationsEnabled}
              onValueChange={setAnimationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animation Speed</Text>
          <Text style={styles.sectionDesc}>Adjust pacing when animations are enabled.</Text>
          <View style={styles.optionRow}>
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((scale) => (
              <TouchableOpacity
                key={`anim-scale-${scale}`}
                style={[styles.pill, animationScale === scale && styles.pillSelected]}
                onPress={() => setAnimationScale(scale)}
              >
                <Text
                  style={[styles.pillText, animationScale === scale && styles.pillTextSelected]}
                >
                  {scale}×
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Text Size</Text>
          <Text style={styles.sectionDesc}>
            Typography respects Dynamic Type by default. Test with system accessibility sizes.
          </Text>
        </View>

        {/* Haptic Intensity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Haptic Feedback Intensity</Text>
          <Text style={styles.sectionDesc}>Control the strength of vibration feedback</Text>
          <View style={styles.optionRow}>
            {["off", "subtle", "normal", "strong"].map((intensity) => (
              <TouchableOpacity
                key={intensity}
                style={[styles.pill, hapticIntensity === intensity && styles.pillSelected]}
                onPress={() =>
                  setHapticIntensity(intensity as "off" | "subtle" | "normal" | "strong")
                }
              >
                <Text
                  style={[
                    styles.pillText,
                    hapticIntensity === intensity && styles.pillTextSelected,
                  ]}
                >
                  {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Quiet Hours</Text>
              <Text style={styles.toggleDesc}>
                Suppress notifications during focus time or sleep.
              </Text>
            </View>
            <Switch
              value={quietHoursEnabled}
              onValueChange={setQuietHoursEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {quietHoursEnabled && (
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <Text style={styles.timeValue}>{quietHoursStart}</Text>
              </View>
              <Text style={styles.timeSeparator}>→</Text>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>End Time</Text>
                <Text style={styles.timeValue}>{quietHoursEnd}</Text>
              </View>
            </View>
          )}
          <Text style={styles.quietHoursNote}>
            💡 Tip: Set quiet hours from 10 PM to 8 AM for better sleep hygiene.
          </Text>
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
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  timeInput: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeValue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  timeSeparator: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  quietHoursNote: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  });
