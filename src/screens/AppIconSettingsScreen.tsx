import React, { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { getAppIconName, setAlternateAppIcon } from "expo-alternate-app-icons";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { fontScaleLimit, typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { APP_ICON_OPTIONS, type AppIconOption } from "../config/appIcons";
import { getAppIconImage } from "../config/appIconImages";
import { announceForAccessibility } from "../utils/announce";

export const AppIconSettingsScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const [current, setCurrent] = useState<string | null>(() => getAppIconName());
  const [error, setError] = useState<string | null>(null);

  const choose = useCallback(
    async (option: AppIconOption) => {
      if (option.id === current) return;
      setError(null);
      try {
        await setAlternateAppIcon(option.id);
        setCurrent(option.id);
        announceForAccessibility(`${option.label} icon selected`);
      } catch {
        setError("Couldn't change the icon. Try again.");
      }
    },
    [current],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header} accessibilityRole="header">
          App icon
        </Text>
        <Text style={styles.description}>Pick how Abridgd looks on your home screen.</Text>

        <View style={styles.list}>
          {APP_ICON_OPTIONS.map((option) => {
            const selected = option.id === current;
            return (
              <Pressable
                key={option.label}
                testID={`app-icon-${option.label.toLowerCase()}`}
                style={[styles.row, selected && styles.rowSelected]}
                onPress={() => choose(option)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label}. ${option.description}`}
              >
                <Image
                  source={getAppIconImage(option.id)}
                  style={styles.preview}
                  accessibilityIgnoresInvertColors
                />
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} maxFontSizeMultiplier={fontScaleLimit.meta}>
                    {option.label}
                  </Text>
                  <Text style={styles.rowDescription} maxFontSizeMultiplier={fontScaleLimit.meta}>
                    {option.description}
                  </Text>
                </View>
                {selected ? (
                  <View style={styles.check}>
                    <Check size={14} color={colors.background} strokeWidth={3} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <Text style={styles.note}>The system may briefly close the app when it changes.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.gutter, paddingTop: spacing.md, paddingBottom: spacing.xxl },
    header: {
      fontFamily: typography.fontFamily.serifBold,
      fontSize: typography.size.xxl,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    description: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.md,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    list: { gap: spacing.sm },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: 76,
      padding: spacing.md,
      borderRadius: 14,
      backgroundColor: colors.secondaryBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
    },
    rowSelected: { borderWidth: 1.5, borderColor: colors.tint },
    preview: { width: 48, height: 48, borderRadius: 12 },
    rowText: { flex: 1 },
    rowTitle: { fontFamily: typography.fontFamily.sans, fontSize: typography.size.md, fontWeight: "600", color: colors.text },
    rowDescription: { fontFamily: typography.fontFamily.sans, fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 2 },
    check: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.tint,
    },
    error: { fontFamily: typography.fontFamily.sans, fontSize: typography.size.sm, color: colors.error, marginTop: spacing.md },
    note: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: spacing.lg,
    },
  });
