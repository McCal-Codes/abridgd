import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { allowedTabs } from "../navigation/tabs";
import {
  ChevronUp,
  ChevronDown,
  Home,
  Search,
  Bookmark,
  Star,
  Flame,
  MapPin,
  User,
  Layers,
  Smartphone,
} from "lucide-react-native";
import { ArticleCategory } from "../types/Article";
import { useSettings } from "../context/SettingsContext";
import type { LucideIcon } from "lucide-react-native";
import { useThemedStyles } from "../theme/useThemedStyles";
import { SettingsToggleRow } from "../components/settings/SettingsRow";

interface TabOption {
  id: string;
  label: string;
  Icon: LucideIcon;
  category?: ArticleCategory;
}

const getAvailableTabs = (layout: "minimal" | "comprehensive"): TabOption[] => {
  const mapping: Record<string, TabOption> = {
    home: { id: "home", label: "Home", Icon: Home },
    discover: { id: "discover", label: "Discover", Icon: Search },
    saved: { id: "saved", label: "Saved", Icon: Bookmark },
    digest: { id: "digest", label: "Digest", Icon: Star },
    profile: { id: "profile", label: "Profile", Icon: User },
    top: { id: "top", label: "Top", Icon: Flame, category: "Top" },
    local: { id: "local", label: "Local", Icon: MapPin, category: "Local" },
  };
  return allowedTabs[layout].map((id) => mapping[id]);
};

export const TabBarSettingsScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const {
    activeTabs,
    setActiveTabs,
    tabLayout,
    setTabLayout,
    defaultTab,
    setDefaultTab,
    tabBarStyle,
    setTabBarStyle,
    showTabLabels,
    setShowTabLabels,
    tabIconSize,
    allowContentUnderTabBar,
    tabBadgeStyle,
    tabIndicatorStyle,
    tabBarDockedHeight,
    tabBarFloatingHeight,
  } = useSettings();
  const [selectedTabs, setSelectedTabs] = useState<string[]>(activeTabs);
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(
    150,
    insets.bottom + (allowContentUnderTabBar ? tabBarDockedHeight || 92 : 0) + spacing.lg,
  );


  const AVAILABLE_TABS = getAvailableTabs(tabLayout);

  const PreviewBar: React.FC = () => {
    const {
      tabBarStyle,
      showTabLabels,
      tabIconSize,
      tabBadgeStyle,
      tabIndicatorStyle,
      tabBarDockedHeight,
    } = useSettings();
    const isStandardPreview = tabBarStyle === "standard";
    const height = isStandardPreview ? tabBarDockedHeight || 92 : tabBarFloatingHeight || 64;

    // The preview is the one mandatory element of the studio, so it has to
    // reflect the edits made directly below it. It previously rendered the
    // first four *available* tabs, ignoring which tabs were active and in
    // what order, so add/remove/reorder appeared to do nothing.
    const previewTabs = selectedTabs
      .map((id) => AVAILABLE_TABS.find((tab) => tab.id === id))
      .filter((tab): tab is (typeof AVAILABLE_TABS)[number] => Boolean(tab));

    return (
      <>
        <View style={styles.previewWrapper}>
          <Text style={styles.previewLabel}>Preview</Text>
          <View
            style={[
              styles.previewCapsule,
              isStandardPreview ? styles.previewStandard : styles.previewFloating,
              { height },
            ]}
          >
            <View style={styles.previewRow}>
              {previewTabs.map((t, i) => (
                <View key={t.id} style={styles.previewItem}>
                  <View
                    style={[
                      styles.previewIcon,
                      { width: tabIconSize, height: tabIconSize, borderRadius: tabIconSize / 2 },
                    ]}
                  >
                    <t.Icon
                      size={tabIconSize ? tabIconSize * 0.6 : 15}
                      color={colors.textSecondary}
                    />
                  </View>
                  {showTabLabels ? <Text style={styles.previewItemLabel}>{t.label}</Text> : null}
                  {tabBadgeStyle === "count" && i === 1 ? (
                    <View style={styles.previewBadge}>
                      <Text style={styles.previewBadgeText}>3</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
            {tabIndicatorStyle !== "none" ? (
              <View
                style={[
                  styles.previewIndicator,
                  tabIndicatorStyle === "underline"
                    ? styles.previewIndicatorUnderline
                    : styles.previewIndicatorBubble,
                ]}
              />
            ) : null}
          </View>
        </View>
      </>
    );
  };

  // Sync with context when it changes
  useEffect(() => {
    setSelectedTabs(activeTabs);
  }, [activeTabs, tabLayout]);

  // Ensure default tab always remains within active selection
  useEffect(() => {
    if (!selectedTabs.includes(defaultTab) && selectedTabs.length > 0) {
      setDefaultTab(selectedTabs[0]);
    }
  }, [selectedTabs, defaultTab, setDefaultTab]);

  const toggleTab = (tabId: string) => {
    if (selectedTabs.includes(tabId)) {
      if (selectedTabs.length <= 3) {
        Alert.alert("Minimum Required", "Keep at least 3 tabs enabled for navigation");
        return;
      }
      const newTabs = selectedTabs.filter((id) => id !== tabId);
      setSelectedTabs(newTabs);
      setActiveTabs(newTabs); // Persist immediately
    } else {
      if (selectedTabs.length >= 5) {
        Alert.alert("Maximum Reached", "You can only have up to 5 tabs in the navigation bar");
        return;
      }
      const newTabs = [...selectedTabs, tabId];
      setSelectedTabs(newTabs);
      setActiveTabs(newTabs); // Persist immediately
    }
  };

  const moveTab = (fromIndex: number, toIndex: number) => {
    const newTabs = [...selectedTabs];
    const [movedTab] = newTabs.splice(fromIndex, 1);
    newTabs.splice(toIndex, 0, movedTab);
    setSelectedTabs(newTabs);
    setActiveTabs(newTabs); // Persist immediately
  };


  const getTabInfo = (tabId: string) => AVAILABLE_TABS.find((t) => t.id === tabId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}>
        <Text style={styles.header}>Tab Bar</Text>
        <Text style={styles.description}>
          Choose which tabs appear, what order they sit in, and how the bar looks.
        </Text>

        {/* Preview always on top for instant feedback */}
        <PreviewBar />


        {/* LAYOUT STYLE SELECTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tab Style</Text>
          <Text style={styles.sectionDesc}>
            Choose between a clean, minimal layout or comprehensive category tabs
          </Text>

          <View style={styles.layoutOptions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: tabLayout === "minimal" }}
              style={[styles.layoutOption, tabLayout === "minimal" && styles.layoutOptionSelected]}
              onPress={() => setTabLayout("minimal")}
            >
              <View style={styles.layoutIconContainer}>
                <Layers
                  size={20}
                  color={tabLayout === "minimal" ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.layoutOptionText,
                  tabLayout === "minimal" && styles.layoutOptionTextSelected,
                ]}
              >
                Minimal
              </Text>
              <Text style={styles.layoutOptionDesc}>Clean, NYT-style with 4 essential tabs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: tabLayout === "comprehensive" }}
              style={[
                styles.layoutOption,
                tabLayout === "comprehensive" && styles.layoutOptionSelected,
              ]}
              onPress={() => setTabLayout("comprehensive")}
            >
              <View style={styles.layoutIconContainer}>
                <Smartphone
                  size={20}
                  color={tabLayout === "comprehensive" ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.layoutOptionText,
                  tabLayout === "comprehensive" && styles.layoutOptionTextSelected,
                ]}
              >
                Comprehensive
              </Text>
              <Text style={styles.layoutOptionDesc}>Full category coverage with 7 tabs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DEFAULT TAB */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Tab on Launch</Text>
          <Text style={styles.sectionDesc}>
            Pick where the app opens. Only active tabs can be selected.
          </Text>
          <View style={styles.rowWrap}>
            {AVAILABLE_TABS.filter((t) => selectedTabs.includes(t.id)).map((tab) => (
              <TouchableOpacity
                key={`default-${tab.id}`}
                style={[styles.pill, defaultTab === tab.id && styles.pillSelected]}
                onPress={() => setDefaultTab(tab.id)}
              >
                <Text style={[styles.pillText, defaultTab === tab.id && styles.pillTextSelected]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TAB BAR APPEARANCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tab Bar Appearance</Text>
          <Text style={styles.sectionDesc}>
            Fine-tune the look and behavior of the bottom tab bar.
          </Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Style</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: tabBarStyle === "floating" }}
                style={[
                  styles.smallOption,
                  tabBarStyle === "floating" && styles.smallOptionSelected,
                ]}
                onPress={() => setTabBarStyle("floating")}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabBarStyle === "floating" && styles.smallOptionTextSelected,
                  ]}
                >
                  Floating
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: tabBarStyle === "compact" }}
                style={[
                  styles.smallOption,
                  tabBarStyle === "compact" && styles.smallOptionSelected,
                ]}
                onPress={() => setTabBarStyle("compact")}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabBarStyle === "compact" && styles.smallOptionTextSelected,
                  ]}
                >
                  Compact
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: tabBarStyle === "standard" }}
                style={[
                  styles.smallOption,
                  tabBarStyle === "standard" && styles.smallOptionSelected,
                ]}
                onPress={() => setTabBarStyle("standard")}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabBarStyle === "standard" && styles.smallOptionTextSelected,
                  ]}
                >
                  Standard
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <SettingsToggleRow
            label="Show Labels"
            value={showTabLabels}
            onValueChange={(v) => setShowTabLabels(v)}
          />

        </View>

        {/* ACTIVE TABS */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Tabs ({selectedTabs.length}/5)</Text>
            <Text style={styles.sectionDesc}>Use the arrows to reorder</Text>

            <View style={styles.tabList}>
              {selectedTabs.map((tabId, index) => {
              const tab = getTabInfo(tabId);
              if (!tab) return null;

              const canMoveUp = index > 0;
              const canMoveDown = index < selectedTabs.length - 1;

              return (
                <View key={tabId} style={styles.activeTabRow}>
                  <View style={styles.reorderControls}>
                    <TouchableOpacity
                      style={styles.reorderButton}
                      onPress={() => moveTab(index, index - 1)}
                      disabled={!canMoveUp}
                      accessibilityRole="button"
                      accessibilityLabel={`Move ${tab.label} up`}
                      accessibilityState={{ disabled: !canMoveUp }}
                      hitSlop={6}
                    >
                      <ChevronUp
                        size={18}
                        color={canMoveUp ? colors.text : colors.tertiaryLabel}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.reorderButton}
                      onPress={() => moveTab(index, index + 1)}
                      disabled={!canMoveDown}
                      accessibilityRole="button"
                      accessibilityLabel={`Move ${tab.label} down`}
                      accessibilityState={{ disabled: !canMoveDown }}
                      hitSlop={6}
                    >
                      <ChevronDown
                        size={18}
                        color={canMoveDown ? colors.text : colors.tertiaryLabel}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.tabInfo}>
                    <tab.Icon size={20} color={colors.primary} />
                    <Text style={styles.tabLabel}>{tab.label}</Text>
                  </View>
                  <View style={styles.tabPosition}>
                    <Text style={styles.positionText}>{index + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => toggleTab(tabId)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${tab.label} tab`}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            </View>
          </View>

        {/* AVAILABLE TABS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Tabs</Text>
          <Text style={styles.sectionDesc}>Tap to add to your navigation bar</Text>

          <View style={styles.availableGrid}>
            {AVAILABLE_TABS.filter((tab) => !selectedTabs.includes(tab.id)).map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={styles.availableTab}
                onPress={() => toggleTab(tab.id)}
              >
                <tab.Icon size={24} color={colors.primary} />
                <Text style={styles.availableTabLabel}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Changes apply immediately — the tab bar will update as soon as you toggle or reorder
            tabs.
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
    fontFamily: typography.fontFamily.serifBold,
    fontSize: 32,
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
  tabList: {
    gap: spacing.sm,
  },
  activeTabRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reorderControls: {
    marginRight: spacing.sm,
  },
  reorderButton: {
    width: 28,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tabLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  tabPosition: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  positionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "700",
    color: colors.surface,
  },
  removeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  removeButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.error,
  },
  availableGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  availableTab: {
    width: "48%",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    gap: spacing.xs,
  },
  availableTabLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  infoBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.tintTransparent,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  layoutOptions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  layoutOption: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  layoutOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.tintTransparent,
  },
  layoutIconContainer: {
    marginBottom: spacing.xs,
  },
  layoutOptionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  layoutOptionTextSelected: {
    color: colors.primary,
  },
  layoutOptionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.tintTransparent,
  },
  pillText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  pillTextSelected: {
    color: colors.primary,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  settingLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.text,
  },
  betaBadge: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: "700",
    color: colors.error,
    backgroundColor: `${colors.error}18`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  optionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  smallOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  smallOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  smallOptionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  smallOptionTextSelected: {
    color: colors.primary,
  },
  heightControlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heightBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  heightBtnText: {
    fontSize: 20,
    color: colors.text,
  },
  heightValue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.text,
    minWidth: 64,
    textAlign: "center",
  },
  previewWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    alignItems: "stretch",
  },
  previewLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  previewCapsule: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  previewFloating: {
    marginHorizontal: 16,
  },
  previewStandard: {
    marginHorizontal: 0,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  previewItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  previewIcon: {
    backgroundColor: colors.secondaryBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  previewItemLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  previewBadge: {
    position: "absolute",
    top: 6,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  previewBadgeText: {
    color: colors.surface,
    fontSize: 10,
  },
  previewIndicator: {
    position: "absolute",
    bottom: 6,
    height: 4,
    width: "30%",
    borderRadius: 2,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.sm,
    columnGap: spacing.sm,
    marginTop: spacing.sm,
  },
  presetCard: {
    flexBasis: "48%",
    backgroundColor: colors.secondaryBackground,
    borderRadius: 14,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  presetCardTitle: {
    fontFamily: typography.fontFamily.serifBold,
    fontSize: 15,
    marginBottom: 4,
  },
  presetCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 6,
  },
  presetCardDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  presetButton: {
    alignSelf: "stretch",
    marginTop: spacing.sm,
  },
  previewIndicatorUnderline: {
    backgroundColor: colors.systemBlue,
  },
  previewIndicatorBubble: {
    backgroundColor: colors.tintTransparent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "stretch",
    padding: 0,
  },
  modalOverlayCenter: {
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  modalContent: {
    width: "100%",
    maxWidth: 720,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    // elevated look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContentCenter: {
    width: "90%",
    maxWidth: 360,
    borderRadius: 14,
    marginHorizontal: 0,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  modalOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    minHeight: 48,
  },
  modalOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalCancelBottom: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalOptionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.text,
  },
  modalCancel: {
    borderBottomWidth: 0,
    marginTop: spacing.sm,
  },
  modalCancelText: {
    color: colors.primary,
    fontWeight: "700",
  },
  });
