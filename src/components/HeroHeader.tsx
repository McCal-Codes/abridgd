import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import type { LucideIcon } from "lucide-react-native";
import { useTheme, Colors } from "../theme/ThemeContext";

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  subtitleTestID?: string;
  Icon?: LucideIcon;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  title,
  subtitle,
  subtitleTestID,
  Icon,
}) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {Icon ? <Icon size={24} color={colors.primary} /> : null}
        <Text style={styles.title} allowFontScaling>
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text style={styles.subtitle} testID={subtitleTestID} allowFontScaling>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    title: {
      fontFamily: typography.fontFamily.serif,
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
  });
