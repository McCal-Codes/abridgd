import React from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useSettings, DigestSummaryMode } from "../context/SettingsContext";

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
    defaultTab,
    setDefaultTab,
  } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Digest Settings</Text>
        <Text style={styles.description}>
          Control what you see when you open the app and how digest summaries are displayed.
        </Text>

        <View style={styles.section}>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Tab on Launch</Text>
          <Text style={styles.sectionDesc}>
            Choose which tab you see first when opening the app.
          </Text>
          <View style={styles.strategyContainer}>
            {[
              { label: "Home", value: "home", description: "Top stories from all sources" },
              { label: "Discover", value: "discover", description: "Browse news by category" },
              { label: "Saved", value: "saved", description: "Your saved articles" },
              { label: "Digest", value: "digest", description: "Your personalized digest" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.value}
                style={[styles.strategyOption, defaultTab === tab.value && styles.selectedStrategy]}
                onPress={() => setDefaultTab(tab.value)}
              >
                <Text
                  style={[
                    styles.strategyLabel,
                    defaultTab === tab.value && styles.selectedStrategyText,
                  ]}
                >
                  {tab.label}
                </Text>
                <Text style={styles.strategyDesc}>{tab.description}</Text>
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
});
