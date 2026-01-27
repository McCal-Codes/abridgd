import React from "react";
import { StyleSheet, Text } from "react-native";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { useTheme } from "../../../theme/ThemeContext";
import { ScaleButton } from "../../../components/ScaleButton";

type PillButtonProps = {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  hitSlop?: number | object;
  testID?: string;
};

/**
 * Small pill-shaped button for lightweight actions like toggles or filters.
 * Keeps padding large enough for 44pt tap targets and honors theme colors.
 */
export const PillButton: React.FC<PillButtonProps> = ({
  label,
  icon,
  onPress,
  accessibilityLabel,
  hitSlop,
  testID,
}) => {
  const { colors } = useTheme();

  return (
    <ScaleButton
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={hitSlop ?? 10}
      testID={testID}
      style={[
        styles.base,
        {
          backgroundColor: colors.secondaryBackground,
          borderColor: colors.border,
        },
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: colors.tint }]} allowFontScaling>
        {label}
      </Text>
    </ScaleButton>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: "700",
    fontSize: typography.size.sm,
  },
});
