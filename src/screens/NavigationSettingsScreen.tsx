import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useNavigation } from "@react-navigation/native";
import { ChevronRight, Layout, Compass, RotateCcw, Sparkles } from "lucide-react-native";
import { useSettings, sanitizeTabs } from "../context/SettingsContext";
import { getTabConfig } from "../navigation/RootNavigator";
import { defaultTabs } from "../navigation/tabs";

export const NavigationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    tabLayout,
    showTabLabels,
    defaultTab,
    setTabLayout,
    setDefaultTab,
    setShowTabLabels,
    activeTabs,
    setActiveTabs,
  } = useSettings();

  const restoreNavigationDefaults = () => {
    setTabLayout("standard");
    setDefaultTab("home");
    setShowTabLabels(true);
  };

  const sanitizedTabs = sanitizeTabs(activeTabs, tabLayout);
  const TAB_CONFIG = getTabConfig(tabLayout);
  const previewTabs = sanitizedTabs.map((id) => TAB_CONFIG[id] || null).filter(Boolean);

  const applyLayout = (layout: typeof tabLayout) => {
    const nextTabs = sanitizeTabs(defaultTabs[layout] as string[], layout);
    setTabLayout(layout);
    setActiveTabs(nextTabs);
    setDefaultTab(nextTabs[0]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Navigation</Text>
        <Text style={styles.description}>
          One place to adjust how you move through the app. For layout control, enter the Tab Bar
          Studio.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tab Bar Studio</Text>
          <Text style={styles.sectionDesc}>Live preview, presets, and advanced appearance.</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => (navigation as any).navigate("TabBarSettings")}
            accessibilityRole="button"
            accessibilityLabel="Open Tab Bar Studio"
          >
            <View style={styles.cardIcon}>
              <Layout color={colors.primary} size={22} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Open Tab Bar Studio</Text>
              <Text style={styles.cardSubtitle}>Edit tabs, presets, labels, icon size, and more.</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Navigation</Text>
          <Text style={styles.sectionDesc}>
            Default tab on launch lives inside Tab Bar Studio to keep all tab decisions together.
          </Text>
          <View style={styles.infoRow}>
            <Compass color={colors.textSecondary} size={18} />
            <Text style={styles.infoText}>Open Tab Bar Studio to pick your default tab.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <Text style={styles.sectionDesc}>Reflects your current active tabs and labels.</Text>
          <View style={[styles.previewBar, tabLayout === "simple" && styles.previewBarSimple]}>
            {previewTabs.map((tab) => (
              <View key={tab.name} style={styles.previewItem}>
                <tab.Icon
                  size={22}
                  color={tab.name === defaultTab ? colors.primary : colors.textSecondary}
                />
                {showTabLabels ? (
                  <Text
                    style={[
                      styles.previewLabel,
                      tab.name === defaultTab && styles.previewLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {tab.title || tab.name}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.restoreButton} onPress={restoreNavigationDefaults}>
          <View style={styles.restoreRow}>
            <RotateCcw color={colors.text} size={18} />
            <Text style={styles.restoreText}>Restore navigation defaults</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: 150 },
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
  section: { marginBottom: spacing.xxl },
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  cardSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  infoText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  restoreButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  restoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
  },
  restoreText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  previewBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  previewBarSimple: {
    justifyContent: "space-around",
  },
  previewItem: {
    flex: 1,
    alignItems: "center",
    minWidth: 64,
  },
  previewLabel: {
    marginTop: 4,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  previewLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
