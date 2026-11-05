import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../../theme/spacing";
import { fontScaleLimit, typography } from "../../theme/typography";
import { ThemeColors } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";
import { StepLayout } from "./StepLayout";

const SAMPLE = [
  { title: "Sample headline from a local newsroom", meta: "WESA · 2h ago · 4 min" },
  { title: "Another sample headline, one line shorter", meta: "PublicSource · 5h ago · 6 min" },
];

/** The welcome shows the real shape of the app: a short brief that ends. */
export const WelcomeStep: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  return (
    <StepLayout
      testID="onboarding-step-welcome"
      eyebrow="ABRIDGD"
      title="A calmer way into Pittsburgh's news."
      body="Start with a short brief. Read what matters. Then be done."
    >
      <View style={styles.card} accessible accessibilityLabel="Example of the Morning Brief, ending with: You're caught up.">
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle} maxFontSizeMultiplier={fontScaleLimit.meta}>
            Morning Brief
          </Text>
          <Text style={styles.cardMeta} maxFontSizeMultiplier={fontScaleLimit.meta}>
            Example
          </Text>
        </View>
        {SAMPLE.map((item) => (
          <View key={item.title} style={styles.row}>
            <View style={styles.thumb} />
            <View style={styles.rowText}>
              <Text style={styles.headline} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {item.title}
              </Text>
              <Text style={styles.meta} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {item.meta}
              </Text>
            </View>
          </View>
        ))}
        <View style={styles.end}>
          <Text style={styles.endText} maxFontSizeMultiplier={fontScaleLimit.meta}>
            You're caught up.
          </Text>
        </View>
      </View>
    </StepLayout>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      padding: spacing.md,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    headerRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
    cardTitle: { fontFamily: typography.fontFamily.serifSemibold, fontSize: 18, color: colors.label },
    cardMeta: { fontFamily: typography.fontFamily.sans, fontSize: 12, color: colors.textTertiary },
    row: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: spacing.md - 4 },
    thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: colors.secondaryBackground },
    rowText: { flex: 1 },
    headline: {
      fontFamily: typography.fontFamily.serifSemibold,
      fontSize: 15,
      lineHeight: 19,
      color: colors.label,
    },
    meta: { marginTop: 4, fontFamily: typography.fontFamily.sans, fontSize: 12, color: colors.textTertiary },
    end: {
      marginTop: spacing.md,
      paddingTop: spacing.md - 2,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      alignItems: "center",
    },
    endText: { fontFamily: typography.fontFamily.serifSemibold, fontSize: 15, color: colors.label },
  });
