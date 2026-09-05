import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import { ScaleButton } from "../../components/ScaleButton";
import { getReleaseNote } from "../../config/releaseNotes";
import { APP_NAME, APP_VERSION } from "../../config/appInfo";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";

interface WhatsNewViewProps {
  /** Defaults to the running version; overridable so the About screen can show any release. */
  version?: string;
  onDismiss: () => void;
}

/**
 * The post-update surface. Until this existed, `shouldShowWhatsNew` routed returning readers
 * into the full first-run onboarding — they were welcomed to an app they already used.
 */
export const WhatsNewView: React.FC<WhatsNewViewProps> = ({ version = APP_VERSION, onDismiss }) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const note = getReleaseNote(version);

  return (
    <View style={styles.container} testID="whats-new">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <Sparkles size={20} color={colors.primary} strokeWidth={2} />
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.4}>
            {APP_NAME} {version}
          </Text>
        </View>

        <Text style={styles.title} accessibilityRole="header" testID="whats-new-headline">
          {note ? note.headline : "What's new"}
        </Text>

        {note ? (
          <View style={styles.list}>
            {note.items.map((item) => (
              <View key={item} style={styles.item}>
                <View style={styles.bullet} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.itemText} testID="whats-new-fallback">
            This update brings fixes and refinements under the hood. Everything you were reading is
            right where you left it.
          </Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.lg) }]}>
        <ScaleButton
          testID="whats-new-dismiss"
          style={styles.button}
          onPress={onDismiss}
          accessibilityLabel="Continue to the app"
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText} maxFontSizeMultiplier={1.6}>
              Continue reading
            </Text>
          </View>
        </ScaleButton>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: spacing.gutter,
      gap: spacing.lg,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    badgeText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
    },
    title: {
      fontFamily: typography.fontFamily.serifSemibold,
      fontSize: typography.size.xl,
      lineHeight: typography.size.xl * typography.lineHeight.dense,
      color: colors.text,
    },
    list: {
      gap: spacing.md,
    },
    item: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 9,
      backgroundColor: colors.primary,
    },
    itemText: {
      flex: 1,
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.md,
      lineHeight: typography.size.md * typography.lineHeight.normal,
      color: colors.textSecondary,
    },
    footer: {
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    button: {
      borderRadius: 16,
      overflow: "hidden",
    },
    buttonContent: {
      minHeight: 50,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 16,
    },
    buttonText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.md,
      fontWeight: "600",
      color: colors.background,
    },
  });
