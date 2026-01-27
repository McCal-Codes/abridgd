import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useSettings, DigestSummaryMode, sanitizeTabs } from "../context/SettingsContext";
import { getTabConfig } from "../navigation/RootNavigator";

const DIGEST_MODES: { label: string; value: DigestSummaryMode; description: string }[] = [
  {
    label: "Fact-Based",
    value: "fact-based",
    description: "Show original article summaries from sources.",
  },
  { label: "AI Summary", value: "ai-summary", description: "AI-generated concise summaries." },
  { label: "Headlines Only", value: "headline-only", description: "Just show article headlines." },
];

export const DigestSettingsScreen: React.FC = () => {
  const {
    isWelcomeBackEnabled,
    setIsWelcomeBackEnabled,
    digestSummaryMode,
    setDigestSummaryMode,
    isContinueReadingEnabled,
    setIsContinueReadingEnabled,
    defaultTab,
    setDefaultTab,
    activeTabs,
    tabLayout,
  } = useSettings();

  const launchTabs = useMemo(() => {
    const config = getTabConfig(tabLayout);
    return sanitizeTabs(activeTabs, tabLayout)
      .map((id) => {
        const tab = config[id];
        if (!tab) return null;
        return { id, label: tab.title || tab.name };
      })
      .filter(Boolean) as { id: string; label: string }[];
  }, [activeTabs, tabLayout]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Digest Settings</Text>
        <Text style={styles.description}>
          Control what you see when you open the app and how digest summaries are displayed.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Launch & Start</Text>
          <Text style={styles.sectionDesc}>Decide what greets you first when you launch.</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Welcome Back Digest</Text>
              <Text style={styles.toggleDesc}>See what you missed when you open the app.</Text>
            </View>
            <Switch
              value={isWelcomeBackEnabled}
              onValueChange={setIsWelcomeBackEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Continue Reading on launch</Text>
              <Text style={styles.toggleDesc}>Jump back to in-progress stories first.</Text>
            </View>
            <Switch
              value={isContinueReadingEnabled}
              onValueChange={setIsContinueReadingEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <Text style={[styles.sectionDesc, { marginTop: spacing.md }]}>Launch destination</Text>
          <View style={styles.launchGrid}>
            {launchTabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.launchOption, defaultTab === tab.id && styles.launchOptionSelected]}
                onPress={() => setDefaultTab(tab.id)}
                accessibilityRole="button"
                accessibilityLabel={`Launch to ${tab.label}`}
              >
                <Text
                  style={[styles.launchLabel, defaultTab === tab.id && styles.launchLabelSelected]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Digest Summary Style</Text>
          <Text style={styles.sectionDesc}>
            Choose how article summaries appear in your daily digest.
          </Text>
          <View style={styles.strategyContainer}>
            {DIGEST_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.strategyOption,
                  digestSummaryMode === mode.value && styles.selectedStrategy,
                ]}
                onPress={() => setDigestSummaryMode(mode.value)}
              >
                <Text
                  style={[
                    styles.strategyLabel,
                    digestSummaryMode === mode.value && styles.selectedStrategyText,
                  ]}
                >
                  {mode.label}
                </Text>
                <Text style={styles.strategyDesc}>{mode.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: 150,
  },
  header: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
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
  sectionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  toggleLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  toggleDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  strategyContainer: {
    gap: spacing.sm,
  },
  strategyOption: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedStrategy: {
    borderColor: colors.primary,
    backgroundColor: "#F0F4F8",
  },
  strategyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  selectedStrategyText: {
    color: colors.primary,
  },
  strategyDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  launchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  launchOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 110,
    alignItems: "center",
  },
  launchOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F0F4F8",
  },
  launchLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  launchLabelSelected: {
    color: colors.primary,
  },
});
