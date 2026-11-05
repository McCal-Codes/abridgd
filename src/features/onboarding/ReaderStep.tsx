import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AbridgedReader } from "../../components/AbridgedReader";
import { spacing } from "../../theme/spacing";
import { fontScaleLimit, typography } from "../../theme/typography";
import { ThemeColors } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";
import { StepLayout } from "./StepLayout";

const DEMO_TEXT =
  "This is the speed reader. One word at a time, held in place, at a pace you choose. Pause it whenever you like, and go back to reading the normal way whenever you like. Nothing here is a test.";

/** Tap-to-try: the reader never starts on its own. */
export const ReaderStep: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  return (
    <StepLayout
      testID="onboarding-step-reader"
      title="Read it your way."
      body="Articles read the normal way by default. If you want a break from scrolling, try the speed reader: one word at a time, held still."
    >
      <View style={styles.demo}>
        <AbridgedReader content={DEMO_TEXT} />
      </View>
      <Text style={styles.note} maxFontSizeMultiplier={fontScaleLimit.meta}>
        {"It never starts on its own, and you can pause it any time. Change it in Settings > Reading."}
      </Text>
    </StepLayout>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    demo: {
      minHeight: 260,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
    },
    note: {
      marginTop: spacing.md,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textTertiary,
    },
  });
