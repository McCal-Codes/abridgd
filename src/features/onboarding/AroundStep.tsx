import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CalendarDays, LifeBuoy } from "lucide-react-native";
import { spacing } from "../../theme/spacing";
import { fontScaleLimit, typography } from "../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";
import { StepLayout } from "./StepLayout";

const EXAMPLES = [
  { weekday: "SAT", day: "7", title: "Neighborhood story hour", meta: "10:30 AM · A park near you" },
  { weekday: "MON", day: "9", title: "City Council meeting", meta: "10:00 AM · City-County Building" },
];

/** Introduces Events and Resources, so neither is a surprise buried in a menu. The event rows are
 * labelled examples: the app makes no network request during onboarding. */
export const AroundStep: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  return (
    <StepLayout
      testID="onboarding-step-around"
      title="More than the news."
      body="What's happening this week, and where to turn for help. Both are in the app, and neither follows you around."
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CalendarDays size={20} color={colors.tintStrong} />
          <Text style={styles.cardTitle}>This week</Text>
          <View style={styles.spacer} />
          <Text style={styles.example} maxFontSizeMultiplier={fontScaleLimit.meta}>
            Example
          </Text>
        </View>
        {EXAMPLES.map((item, index) => (
          <View key={item.title} style={[styles.row, index === 0 && styles.rowDivider]}>
            <View style={styles.dateBlock}>
              <Text style={styles.weekday} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {item.weekday}
              </Text>
              <Text style={styles.day} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {item.day}
              </Text>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {item.title}
              </Text>
              <Text style={styles.rowMeta} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {item.meta}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.note} maxFontSizeMultiplier={fontScaleLimit.meta}>
        Add any event to your calendar. Abridgd opens your calendar app and never reads it.
      </Text>

      <View style={styles.resources}>
        <View style={styles.resourceIcon}>
          <LifeBuoy size={22} color={colors.tintStrong} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.resourceTitle}>Resources</Text>
          <Text style={styles.rowMeta} maxFontSizeMultiplier={fontScaleLimit.meta}>
            Crisis lines, food, housing and city services. Works offline, in Settings.
          </Text>
        </View>
      </View>
    </StepLayout>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      paddingTop: spacing.md - 2,
      paddingHorizontal: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.xs },
    cardTitle: { fontFamily: typography.fontFamily.serifSemibold, fontSize: 18, color: colors.label },
    spacer: { flex: 1 },
    example: { fontFamily: typography.fontFamily.sans, fontSize: 12, color: colors.textTertiary },
    row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingVertical: 6 },
    rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    dateBlock: {
      width: 46,
      height: 48,
      borderRadius: 10,
      backgroundColor: colors.tintTransparent,
      alignItems: "center",
      justifyContent: "center",
    },
    weekday: { fontFamily: typography.fontFamily.sans, fontSize: 10, fontWeight: "600", color: colors.tintStrong },
    day: { fontFamily: typography.fontFamily.serifBold, fontSize: 19, lineHeight: 21, color: colors.label },
    rowText: { flex: 1 },
    rowTitle: { fontFamily: typography.fontFamily.serifSemibold, fontSize: 15, color: colors.label },
    rowMeta: {
      marginTop: 2,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    note: {
      marginTop: spacing.sm,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textTertiary,
    },
    resources: {
      marginTop: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: spacing.md - 2,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    resourceIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.tintTransparent,
      alignItems: "center",
      justifyContent: "center",
    },
    resourceTitle: { fontFamily: typography.fontFamily.serifSemibold, fontSize: 16, color: colors.label },
  });
