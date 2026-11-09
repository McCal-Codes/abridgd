import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { ThemeColors } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";

interface Props {
  title: string;
  body?: string;
  eyebrow?: string;
  children?: React.ReactNode;
  testID?: string;
}

/** One title, one calm paragraph, then the step's own content. Every step uses it so the six
 * screens read as one flow. */
export const StepLayout: React.FC<Props> = ({ title, body, eyebrow, children, testID }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.root} testID={testID}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {children ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    eyebrow: {
      marginBottom: spacing.sm,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 1,
      color: colors.tintStrong,
    },
    title: {
      fontFamily: typography.fontFamily.serifBold,
      fontSize: 32,
      lineHeight: 37,
      color: colors.label,
    },
    body: {
      marginTop: spacing.sm + 4,
      fontFamily: typography.fontFamily.sans,
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    content: { marginTop: spacing.lg },
  });
