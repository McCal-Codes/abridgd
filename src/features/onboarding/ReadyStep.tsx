import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { spacing } from "../../theme/spacing";
import { fontScaleLimit, typography } from "../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";
import { StepLayout } from "./StepLayout";

/** Only promises the app keeps. "No analytics on how you read" is exact: crash reports exist and
 * carry no stories or URLs, so the wording says so rather than claiming "no tracking". */
const PLEDGES = [
  { title: "No account", body: "Open the app and read. That's it." },
  {
    title: "No ads, no analytics on how you read",
    body: "Crash reports only, with no stories or URLs in them.",
  },
  {
    title: "Your data stays on your phone",
    body: "Saved stories, saved events and progress live here, and nowhere else.",
  },
  { title: "An end to every feed", body: "You reach the bottom. Then you're done." },
];

export const ReadyStep: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  return (
    <StepLayout
      testID="onboarding-step-ready"
      title="You're all set."
      body="A simpler place to catch up on Pittsburgh. Here's what we promise."
    >
      <View style={styles.list}>
        {PLEDGES.map((pledge) => (
          <View key={pledge.title} style={styles.item}>
            <View style={styles.check}>
              <Check size={16} color={colors.tintStrong} strokeWidth={3} />
            </View>
            <View style={styles.text}>
              <Text style={styles.itemTitle} maxFontSizeMultiplier={fontScaleLimit.control}>
                {pledge.title}
              </Text>
              <Text style={styles.itemBody} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {pledge.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </StepLayout>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    list: { gap: 4 },
    item: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: spacing.sm + 2 },
    check: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.tintTransparent,
      alignItems: "center",
      justifyContent: "center",
    },
    text: { flex: 1 },
    itemTitle: { fontFamily: typography.fontFamily.sans, fontSize: 16, fontWeight: "600", color: colors.label },
    itemBody: {
      marginTop: 2,
      fontFamily: typography.fontFamily.sans,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
  });
