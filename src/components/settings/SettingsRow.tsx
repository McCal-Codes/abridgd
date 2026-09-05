import React from "react";
import { Pressable, StyleSheet, Switch, Text, View, ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { spacing } from "../../theme/spacing";
import { fontScaleLimit, typography } from "../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, style }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.section, style]}>
      {title ? (
        <Text style={styles.sectionTitle} accessibilityRole="header" maxFontSizeMultiplier={1.8}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
};

interface SettingsToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * A settings toggle where the whole row is the control.
 *
 * Every settings screen previously built this by hand as a plain View holding unassociated
 * text next to a bare Switch, which meant VoiceOver read the label and the switch as separate
 * items and the description not at all — and only the switch's own thumb was tappable.
 */
export const SettingsToggleRow: React.FC<SettingsToggleRowProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled,
  testID,
}) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      testID={testID}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessible
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={[styles.row, disabled && styles.rowDisabled]}
    >
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowLabel} maxFontSizeMultiplier={fontScaleLimit.control}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.rowDescription} maxFontSizeMultiplier={fontScaleLimit.control}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        // The row above already announces label, hint and checked state; letting the switch
        // announce too would read the same setting twice.
        importantForAccessibility="no-hide-descendants"
      />
    </Pressable>
  );
};

interface SettingsDisclosureRowProps {
  label: string;
  description?: string;
  onPress: () => void;
  /** Rendered ahead of the label — a lucide icon element, typically. */
  icon?: React.ReactNode;
  /** Shown between the text and the chevron, e.g. the current value. */
  value?: string;
  testID?: string;
}

export const SettingsDisclosureRow: React.FC<SettingsDisclosureRowProps> = ({
  label,
  description,
  onPress,
  icon,
  value,
  testID,
}) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityHint={description}
      style={styles.row}
    >
      {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowLabel} maxFontSizeMultiplier={fontScaleLimit.control}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.rowDescription} maxFontSizeMultiplier={fontScaleLimit.control}>
            {description}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={styles.rowValue} maxFontSizeMultiplier={fontScaleLimit.control}>
          {value}
        </Text>
      ) : null}
      <ChevronRight size={20} color={colors.textSecondary} />
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
      // Apple's 44pt minimum, as a floor the row grows past rather than a fixed height that
      // would clip its own text at large accessibility sizes.
      minHeight: 44,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowDisabled: {
      opacity: 0.5,
    },
    rowIcon: {
      width: 28,
      alignItems: "center",
    },
    rowTextContainer: {
      flex: 1,
      paddingRight: spacing.md,
    },
    rowLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    rowDescription: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    rowValue: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 15,
      color: colors.textSecondary,
    },
  });
