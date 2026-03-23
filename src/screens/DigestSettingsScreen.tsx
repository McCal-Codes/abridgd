import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DigestSummaryMode, sanitizeTabs, useSettings } from "../context/SettingsContext";
import { getTabConfig } from "../navigation/RootNavigator";
import { spacing } from "../theme/spacing";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";

const DIGEST_MODES: { label: string; value: DigestSummaryMode; description: string }[] = [
  {
    label: "Fact-Based",
    value: "fact-based",
    description: "Show original article summaries from sources.",
  },
  {
    label: "AI Summary",
    value: "ai-summary",
    description: "Use Perplexity when a key is saved, then fall back gracefully.",
  },
  {
    label: "Headlines Only",
    value: "headline-only",
    description: "Just show article headlines.",
  },
];

export const DigestSettingsScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
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
    perplexityApiKey,
    setPerplexityApiKey,
  } = useSettings();
  const [apiKeyDraft, setApiKeyDraft] = useState(perplexityApiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setApiKeyDraft(perplexityApiKey);
  }, [perplexityApiKey]);

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

  const normalizedApiKeyDraft = apiKeyDraft.trim();
  const hasApiKeyChanges = normalizedApiKeyDraft !== perplexityApiKey;

  const handleSaveApiKey = async () => {
    await setPerplexityApiKey(apiKeyDraft);
  };

  const handleClearApiKey = async () => {
    setApiKeyDraft("");
    setShowApiKey(false);
    await setPerplexityApiKey("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Digest Settings</Text>
        <Text style={styles.description}>
          Control what greets you on launch and how Abridged builds summaries.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Launch & Start</Text>
          <Text style={styles.sectionDesc}>Decide what appears first when you open the app.</Text>

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
              <Text style={styles.toggleLabel}>Continue Reading on Launch</Text>
              <Text style={styles.toggleDesc}>Jump back into in-progress articles first.</Text>
            </View>
            <Switch
              value={isContinueReadingEnabled}
              onValueChange={setIsContinueReadingEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <Text style={[styles.sectionDesc, styles.launchLabelCopy]}>Launch destination</Text>
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

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Perplexity API Key</Text>
              <Text style={styles.sectionDesc}>
                Optional. Stored only on this device for digest and article summaries.
              </Text>
            </View>
            {perplexityApiKey ? (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>Saved</Text>
              </View>
            ) : null}
          </View>

          <TextInput
            value={apiKeyDraft}
            onChangeText={setApiKeyDraft}
            style={styles.apiKeyInput}
            placeholder="pplx-..."
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!showApiKey}
            textContentType="password"
            accessibilityLabel="Perplexity API key"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, !perplexityApiKey && styles.disabledButton]}
              onPress={() => void handleClearApiKey()}
              disabled={!perplexityApiKey}
              accessibilityRole="button"
              accessibilityLabel="Clear saved API key"
            >
              <Text style={styles.secondaryButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowApiKey((current) => !current)}
              accessibilityRole="button"
              accessibilityLabel={showApiKey ? "Hide API key" : "Show API key"}
            >
              <Text style={styles.secondaryButtonText}>{showApiKey ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, !hasApiKeyChanges && styles.disabledPrimaryButton]}
              onPress={() => void handleSaveApiKey()}
              disabled={!hasApiKeyChanges}
              accessibilityRole="button"
              accessibilityLabel="Save API key"
            >
              <Text style={styles.primaryButtonText}>Save Key</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>
            If no key is saved, Abridged uses extractive summaries instead of calling Perplexity.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    sectionHeaderText: {
      flex: 1,
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
    launchLabelCopy: {
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    toggleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
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
      backgroundColor: colors.tintTransparent,
    },
    strategyLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    selectedStrategyText: {
      color: colors.primary,
    },
    strategyDesc: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.textSecondary,
    },
    launchGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
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
      backgroundColor: colors.tintTransparent,
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
    savedBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.tintTransparent,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    savedBadgeText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
    },
    apiKeyInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      color: colors.text,
      fontFamily: typography.fontFamily.mono,
      fontSize: 14,
    },
    buttonRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    primaryButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      paddingVertical: spacing.md,
      backgroundColor: colors.primary,
    },
    disabledPrimaryButton: {
      opacity: 0.45,
    },
    primaryButtonText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 14,
      fontWeight: "700",
      color: colors.surface,
    },
    secondaryButton: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    disabledButton: {
      opacity: 0.45,
    },
    secondaryButtonText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    helperText: {
      marginTop: spacing.sm,
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textSecondary,
    },
  });
