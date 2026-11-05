import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ExternalLink } from "lucide-react-native";
import { spacing } from "../../theme/spacing";
import { fontScaleLimit, typography } from "../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";
import { openExternalUrl } from "../../utils/openExternalUrl";
import { LAST_VERIFIED, ResourceAction, ResourceEntry, RESOURCE_GROUPS } from "./data";
import { actionLabel, performAction } from "./phone";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatVerified = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

const ActionButton: React.FC<{ entry: ResourceEntry; action: ResourceAction; primary: boolean }> = ({
  entry,
  action,
  primary,
}) => {
  const styles = useThemedStyles(createStyles);
  const label = actionLabel(action);
  const number = entry.displayNumber ?? action.number;
  return (
    <Pressable
      onPress={() => void performAction(action, number)}
      style={[styles.action, primary ? styles.actionPrimary : styles.actionSecondary]}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${entry.name}`}
      accessibilityHint={
        action.kind === "call" ? `Opens your phone to call ${number}` : `Opens messages to text ${number}`
      }
    >
      <Text
        style={[styles.actionText, primary ? styles.actionTextPrimary : styles.actionTextSecondary]}
        maxFontSizeMultiplier={fontScaleLimit.action}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const ResourcesScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xl + insets.bottom }}
        testID="resources-list"
      >
        <View style={styles.hero}>
          <Text style={styles.title} accessibilityRole="header">
            Resources
          </Text>
          <Text style={styles.subtitle}>
            Local help and services. Works offline. Numbers open your phone's dialer.
          </Text>
        </View>

        <View style={styles.emergency} accessibilityRole="alert">
          <Text style={styles.emergencyText}>
            <Text style={styles.emergencyStrong}>In an emergency, call 911.</Text> The lines below
            are for support, not emergencies.
          </Text>
        </View>

        {RESOURCE_GROUPS.map((group) => (
          <View key={group.id}>
            <Text style={styles.groupTitle} accessibilityRole="header" maxFontSizeMultiplier={fontScaleLimit.meta}>
              {group.title.toUpperCase()}
            </Text>
            <View style={styles.card}>
              {group.entries.map((entry, index) => (
                <View
                  key={entry.id}
                  style={[styles.row, index < group.entries.length - 1 && styles.rowDivider]}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.name}>{entry.name}</Text>
                    <Text style={styles.description} maxFontSizeMultiplier={fontScaleLimit.meta}>
                      {entry.description}
                      {entry.displayNumber && !entry.description.includes(entry.displayNumber)
                        ? ` ${entry.displayNumber}`
                        : ""}
                    </Text>
                    {entry.url ? (
                      <Pressable
                        onPress={() => void openExternalUrl(entry.url)}
                        style={styles.link}
                        accessibilityRole="link"
                        accessibilityLabel={`${entry.name} website`}
                      >
                        <Text style={styles.linkText} maxFontSizeMultiplier={fontScaleLimit.meta}>
                          Website
                        </Text>
                        <ExternalLink size={13} color={colors.tintStrong} />
                      </Pressable>
                    ) : null}
                  </View>
                  <View style={styles.actions}>
                    {entry.actions.map((action, i) => (
                      <ActionButton key={`${action.kind}-${i}`} entry={entry} action={action} primary={i === 0} />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footer} maxFontSizeMultiplier={fontScaleLimit.meta}>
          Numbers last checked {formatVerified(LAST_VERIFIED)}. Abridgd isn't affiliated with these
          services and never sees who you call or text. If a number is wrong, tell us in App info.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    hero: { paddingHorizontal: spacing.gutter, paddingTop: spacing.md },
    title: {
      fontFamily: typography.fontFamily.serifBold,
      fontSize: typography.size.xxl,
      lineHeight: 38,
      color: colors.label,
    },
    subtitle: {
      marginTop: spacing.xs,
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    emergency: {
      marginHorizontal: spacing.gutter,
      marginTop: spacing.md,
      padding: spacing.md - 2,
      borderRadius: 14,
      backgroundColor: "rgba(211,47,47,0.10)",
      borderWidth: 1,
      borderColor: "rgba(211,47,47,0.35)",
    },
    emergencyText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      lineHeight: 20,
      color: colors.label,
    },
    emergencyStrong: { fontWeight: "700" },
    groupTitle: {
      marginHorizontal: spacing.gutter,
      marginTop: spacing.lg - 6,
      marginBottom: spacing.sm,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.6,
      color: colors.textSecondary,
    },
    card: {
      marginHorizontal: spacing.gutter,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm + 2,
      paddingVertical: spacing.sm + 2,
      paddingLeft: spacing.md,
      paddingRight: spacing.sm,
      minHeight: 76,
    },
    rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    rowText: { flex: 1, minWidth: 0 },
    name: {
      fontFamily: typography.fontFamily.serifSemibold,
      fontSize: 16,
      lineHeight: 21,
      color: colors.label,
    },
    description: {
      marginTop: 2,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    link: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44, alignSelf: "flex-start" },
    linkText: { fontFamily: typography.fontFamily.sans, fontSize: 13, color: colors.tintStrong },
    actions: { flexDirection: "row", gap: spacing.sm },
    action: {
      minWidth: 64,
      minHeight: 44,
      paddingHorizontal: spacing.md,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    actionPrimary: { backgroundColor: colors.tintStrong },
    actionSecondary: { borderWidth: 1, borderColor: colors.tintStrong },
    actionText: { fontFamily: typography.fontFamily.sans, fontSize: 14, fontWeight: "600" },
    actionTextPrimary: { color: colors.onTintStrong },
    actionTextSecondary: { color: colors.tintStrong },
    footer: {
      marginTop: spacing.lg - 6,
      marginHorizontal: spacing.lg + 4,
      textAlign: "center",
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textTertiary,
    },
  });
