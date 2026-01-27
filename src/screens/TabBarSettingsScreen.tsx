import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { GlassButton } from "../components/GlassButton";
import { allowedTabs, TabLayoutMode } from "../navigation/tabs";
import {
  GripVertical,
  Check,
  Home,
  Search,
  Bookmark,
  Star,
  Flame,
  MapPin,
  Newspaper,
  User,
  Layers,
  Smartphone,
  Star as Sparkles,
  Minimize2,
  Square,
  Settings as SettingsIcon,
} from "lucide-react-native";
import { Switch } from "react-native";
import { ArticleCategory } from "../types/Article";
import { sanitizeTabs, useSettings } from "../context/SettingsContext";
import type { LucideIcon } from "lucide-react-native";

interface TabOption {
  id: string;
  label: string;
  Icon: LucideIcon;
  category?: ArticleCategory;
}

const getAvailableTabs = (layout: TabLayoutMode): TabOption[] => {
  const mapping: Record<string, TabOption> = {
    home: { id: "home", label: "Home", Icon: Home },
    settings: { id: "settings", label: "Settings", Icon: SettingsIcon },
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
    setTabIconSize,
    tabBarBlur,
    setTabBarBlur,
    allowContentUnderTabBar,
    setAllowContentUnderTabBar,
    tabBadgeStyle,
    setTabBadgeStyle,
    tabIndicatorStyle,
    setTabIndicatorStyle,
    tabBarDockedHeight,
    setTabBarDockedHeight,
    tabBarHiddenHeight,
    setTabBarHiddenHeight,
    tabBarFloatingHeight,
    setTabBarFloatingHeight,
    modalPresentationStyle,
    enableAdvancedHeightControls,
    dockedHeightStep,
    hiddenHeightStep,
    floatingHeightStep,
    setDockedHeightStep,
    setHiddenHeightStep,
    setFloatingHeightStep,
    experimentalIOS26NavBar,
    setExperimentalIOS26NavBar,
  } = useSettings();
  const [selectedTabs, setSelectedTabs] = useState<string[]>(activeTabs);
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(
    150,
    insets.bottom + (allowContentUnderTabBar ? tabBarDockedHeight || 92 : 0) + spacing.lg,
  );

  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [presetModalType, setPresetModalType] = useState<"docked" | "hidden" | "floating" | null>(
    null,
  );

  const dockedTemplates = [
    { label: "Compact", value: 92 },
    { label: "Default", value: 100 },
    { label: "Spacious", value: 110 },
  ];

  const floatingTemplates = [
    { label: "Slim", value: 48 },
    { label: "Default", value: 64 },
    { label: "Comfortable", value: 80 },
  ];

  const getDockedTemplateLabel = (val: number) =>
    dockedTemplates.find((t) => t.value === val)?.label || "Custom";
  const getFloatingTemplateLabel = (val: number) =>
    floatingTemplates.find((t) => t.value === val)?.label || "Custom";
  const getHiddenTemplateLabel = (val: number) => {
    const base = tabBarDockedHeight || 92;
    const choices = [base + 8, base + 16, base + 32];
    const labels = ["Compact", "Default", "Tall"];
    const idx = choices.indexOf(val);
    return idx >= 0 ? labels[idx] : "Custom";
  };

  const openPresetMenu = (type: "docked" | "hidden" | "floating") => {
    setPresetModalType(type);
    setPresetModalVisible(true);
  };

  const closePresetMenu = () => {
    setPresetModalVisible(false);
    setPresetModalType(null);
  };

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

    const previewTabs = AVAILABLE_TABS.slice(0, 4);

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
        {/* Preset selection modal */}
        <Modal
          visible={presetModalVisible}
          transparent
          animationType={presetModalType === "hidden" ? "slide" : "fade"}
          onRequestClose={closePresetMenu}
        >
          {(() => {
            const modalPref = modalPresentationStyle || "auto";
            const isBottom =
              modalPref === "bottom" || (modalPref === "auto" && presetModalType === "hidden");
            return (
              <Pressable
                style={[styles.modalOverlay, isBottom ? null : styles.modalOverlayCenter]}
                onPress={closePresetMenu}
              >
                <Pressable
                  style={[
                    styles.modalContent,
                    isBottom
                      ? { paddingBottom: insets.bottom + spacing.md }
                      : styles.modalContentCenter,
                  ]}
                  onPress={() => {
                    /* consume touches so overlay doesn't immediately close */
                  }}
                >
                  {presetModalType === "docked" && (
                    <>
                      {dockedTemplates.map((t) => (
                        <TouchableOpacity
                          key={`modal-d-${t.value}`}
                          style={styles.modalOption}
                          onPress={() => {
                            setTabBarDockedHeight(t.value);
                            closePresetMenu();
                          }}
                        >
                          <View style={styles.modalOptionLeft}>
                            <Text style={styles.modalOptionText}>{t.label}</Text>
                          </View>
                          {t.value === (tabBarDockedHeight || 92) ? (
                            <Check size={18} color={colors.primary} />
                          ) : null}
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                  {presetModalType === "hidden" &&
                    (() => {
                      const base = tabBarDockedHeight || 92;
                      const opts = [
                        { label: "Compact", value: base + 8 },
                        { label: "Default", value: base + 16 },
                        { label: "Tall", value: base + 32 },
                      ];
                      return opts.map((t) => (
                        <TouchableOpacity
                          key={`modal-h-${t.value}`}
                          style={styles.modalOption}
                          onPress={() => {
                            setTabBarHiddenHeight(t.value);
                            closePresetMenu();
                          }}
                        >
                          <View style={styles.modalOptionLeft}>
                            <Text style={styles.modalOptionText}>{t.label}</Text>
                          </View>
                          {t.value === (tabBarHiddenHeight || (tabBarDockedHeight || 92) + 16) ? (
                            <Check size={18} color={colors.primary} />
                          ) : null}
                        </TouchableOpacity>
                      ));
                    })()}
                  {presetModalType === "floating" && (
                    <>
                      {floatingTemplates.map((t) => (
                        <TouchableOpacity
                          key={`modal-f-${t.value}`}
                          style={styles.modalOption}
                          onPress={() => {
                            setTabBarFloatingHeight(t.value);
                            closePresetMenu();
                          }}
                        >
                          <View style={styles.modalOptionLeft}>
                            <Text style={styles.modalOptionText}>{t.label}</Text>
                          </View>
                          {t.value === (tabBarFloatingHeight || 64) ? (
                            <Check size={18} color={colors.primary} />
                          ) : null}
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                  {isBottom ? (
                    <TouchableOpacity
                      style={[styles.modalOption, styles.modalCancelBottom]}
                      onPress={closePresetMenu}
                    >
                      <Text style={[styles.modalOptionText, styles.modalCancelText]}>Cancel</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.modalOption, styles.modalCancel]}
                      onPress={closePresetMenu}
                    >
                      <Text style={[styles.modalOptionText, styles.modalCancelText]}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </Pressable>
              </Pressable>
            );
          })()}
        </Modal>
      </>
    );
  };

  // Sync with context when it changes
  useEffect(() => {
    setSelectedTabs(activeTabs);
  }, [activeTabs, tabLayout]);

  // When layout changes, sanitize active tabs to available set for that layout
  useEffect(() => {
    const sanitized = sanitizeTabs(selectedTabs, tabLayout);
    if (sanitized.join("|") !== selectedTabs.join("|")) {
      setSelectedTabs(sanitized);
      setActiveTabs(sanitized);
      if (!sanitized.includes(defaultTab) && sanitized.length) {
        setDefaultTab(sanitized[0]);
      }
    }
  }, [tabLayout, selectedTabs, setActiveTabs, defaultTab, setDefaultTab]);

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

  const promptReorder = (index: number) => {
    const hasUp = index > 0;
    const hasDown = index < selectedTabs.length - 1;
    if (!hasUp && !hasDown) return;

    const handleMoveUp = () => moveTab(index, index - 1);
    const handleMoveDown = () => moveTab(index, index + 1);

    if (Platform.OS === "ios") {
      const options = [
        ...(hasUp ? ["Move Up"] : []),
        ...(hasDown ? ["Move Down"] : []),
        "Cancel",
      ];
      const cancelButtonIndex = options.length - 1;
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Reorder Tab",
          options,
          cancelButtonIndex,
          userInterfaceStyle: "light",
        },
        (buttonIndex) => {
          if (hasUp && buttonIndex === 0) return handleMoveUp();
          if (hasUp && hasDown && buttonIndex === 1) return handleMoveDown();
          if (!hasUp && hasDown && buttonIndex === 0) return handleMoveDown();
        },
      );
      return;
    }

    const buttons = [];
    if (hasUp) {
      buttons.push({ text: "Move Up", onPress: handleMoveUp });
    }
    if (hasDown) {
      buttons.push({ text: "Move Down", onPress: handleMoveDown });
    }
    buttons.push({ text: "Cancel", style: "cancel" as const });
    Alert.alert("Reorder Tab", "Tap where you want to move this tab.", buttons);
  };

  const getTabInfo = (tabId: string) => AVAILABLE_TABS.find((t) => t.id === tabId);

  const applyFloatingPreset = () => {
    setTabBarStyle("floating");
    setTabBarBlur(true);
    setTabBarFloatingHeight(64);
    setShowTabLabels(true);
  };

  const applyStandardPreset = () => {
    setTabBarStyle("standard");
    setTabBarBlur(false);
    setTabBarDockedHeight(100);
    setShowTabLabels(true);
  };

  const applyCompactPreset = () => {
    setTabBarStyle("compact");
    setTabBarBlur(true);
    setTabBarFloatingHeight(54);
    setShowTabLabels(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}>
        <Text style={styles.header}>Tab Bar Studio</Text>
        <Text style={styles.description}>
          Shape the bottom navigation to match iOS 26-inspired chrome. Pick presets, tweak spacing,
          and reorder tabs.
        </Text>

        {/* Preview always on top for instant feedback */}
        <PreviewBar />

        {/* Quick presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Presets</Text>
          <Text style={styles.sectionDesc}>Start from a style, then fine-tune below</Text>
          <View style={styles.presetGrid}>
            <View style={styles.presetCard}>
              <View style={styles.presetCardHeader}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={styles.presetCardTitle}>iOS 26 Floating</Text>
              </View>
              <Text style={styles.presetCardDesc}>Blurred capsule, labels on</Text>
              <GlassButton
                label="Apply"
                onPress={applyFloatingPreset}
                icon={<Sparkles size={16} color={colors.text} />}
                prominence="tinted"
                compact
                style={styles.presetButton}
              />
            </View>
            <View style={styles.presetCard}>
              <View style={styles.presetCardHeader}>
                <Square size={18} color={colors.textSecondary} />
                <Text style={styles.presetCardTitle}>Standard Docked</Text>
              </View>
              <Text style={styles.presetCardDesc}>Solid bar, comfortable height</Text>
              <GlassButton
                label="Apply"
                onPress={applyStandardPreset}
                icon={<Check size={16} color={colors.text} />}
                prominence="standard"
                compact
                style={styles.presetButton}
              />
            </View>
            <View style={styles.presetCard}>
              <View style={styles.presetCardHeader}>
                <Minimize2 size={18} color={colors.textSecondary} />
                <Text style={styles.presetCardTitle}>Compact Minimal</Text>
              </View>
              <Text style={styles.presetCardDesc}>Slim, labels off, tinted blur</Text>
              <GlassButton
                label="Apply"
                onPress={applyCompactPreset}
                icon={<Minimize2 size={16} color={colors.text} />}
                prominence="filled"
                compact
                style={styles.presetButton}
              />
            </View>
          </View>
        </View>

        {/* LAYOUT STYLE SELECTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tab Style</Text>
          <Text style={styles.sectionDesc}>
            Choose between a calming two-tap flow, a balanced everyday set, or the full Top/Local
            power layout.
          </Text>

          <View style={styles.layoutOptions}>
            <TouchableOpacity
              style={[styles.layoutOption, tabLayout === "simple" && styles.layoutOptionSelected]}
              onPress={() => setTabLayout("simple")}
            >
              <View style={styles.layoutIconContainer}>
                <Minimize2
                  size={20}
                  color={tabLayout === "simple" ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.layoutOptionText,
                  tabLayout === "simple" && styles.layoutOptionTextSelected,
                ]}
              >
                Simple
              </Text>
              <Text style={styles.layoutOptionDesc}>
                Just News and Settings for the cleanest flow.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.layoutOption,
                tabLayout === "standard" && styles.layoutOptionSelected,
              ]}
              onPress={() => setTabLayout("standard")}
            >
              <View style={styles.layoutIconContainer}>
                <Layers
                  size={20}
                  color={tabLayout === "standard" ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.layoutOptionText,
                  tabLayout === "standard" && styles.layoutOptionTextSelected,
                ]}
              >
                Standard
              </Text>
              <Text style={styles.layoutOptionDesc}>
                Everyday mix: Home, Discover, Saved, Digest, Profile.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.layoutOption, tabLayout === "power" && styles.layoutOptionSelected]}
              onPress={() => setTabLayout("power")}
            >
              <View style={styles.layoutIconContainer}>
                <Smartphone
                  size={20}
                  color={tabLayout === "power" ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.layoutOptionText,
                  tabLayout === "power" && styles.layoutOptionTextSelected,
                ]}
              >
                Power
              </Text>
              <Text style={styles.layoutOptionDesc}>
                Top + Local + Digest with quick saves and Profile.
              </Text>
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

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Labels</Text>
            <Switch value={showTabLabels} onValueChange={(v) => setShowTabLabels(v)} />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Icon Size</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.smallOption, tabIconSize === 20 && styles.smallOptionSelected]}
                onPress={() => setTabIconSize(20)}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabIconSize === 20 && styles.smallOptionTextSelected,
                  ]}
                >
                  Small
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallOption, tabIconSize === 25 && styles.smallOptionSelected]}
                onPress={() => setTabIconSize(25)}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabIconSize === 25 && styles.smallOptionTextSelected,
                  ]}
                >
                  Medium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallOption, tabIconSize === 30 && styles.smallOptionSelected]}
                onPress={() => setTabIconSize(30)}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabIconSize === 30 && styles.smallOptionTextSelected,
                  ]}
                >
                  Large
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              Experimental iOS 26 Navbar
              <Text style={styles.betaBadge}> BETA</Text>
            </Text>
            <Switch
              value={experimentalIOS26NavBar}
              onValueChange={(v) => setExperimentalIOS26NavBar(v)}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Background Blur</Text>
            <Switch value={tabBarBlur} onValueChange={(v) => setTabBarBlur(v)} />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Docked Height</Text>
            {enableAdvancedHeightControls ? (
              <View style={styles.heightControlRow}>
                <TouchableOpacity
                  style={styles.heightBtn}
                  onPress={() =>
                    setTabBarDockedHeight(
                      Math.max(92, (tabBarDockedHeight || 92) - (dockedHeightStep || 2)),
                    )
                  }
                >
                  <Text style={styles.heightBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.heightValue}>{tabBarDockedHeight || 92}px</Text>
                <TouchableOpacity
                  style={styles.heightBtn}
                  onPress={() =>
                    setTabBarDockedHeight((tabBarDockedHeight || 92) + (dockedHeightStep || 2))
                  }
                >
                  <Text style={styles.heightBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={styles.smallOption}
                  onPress={() => openPresetMenu("docked")}
                >
                  <Text style={styles.smallOptionText}>
                    {getDockedTemplateLabel(tabBarDockedHeight || 92)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {enableAdvancedHeightControls && (
            <View style={[styles.settingRow, { marginTop: spacing.xs }]}>
              <Text style={styles.settingLabel}>Docked step</Text>
              <View style={styles.optionRow}>
                {[1, 2, 4].map((s) => (
                  <TouchableOpacity
                    key={`dock-step-${s}`}
                    style={[
                      styles.smallOption,
                      dockedHeightStep === s && styles.smallOptionSelected,
                    ]}
                    onPress={() => setDockedHeightStep(s)}
                  >
                    <Text
                      style={[
                        styles.smallOptionText,
                        dockedHeightStep === s && styles.smallOptionTextSelected,
                      ]}
                    >
                      {s}px
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Hidden/Collapsed Height</Text>
            {enableAdvancedHeightControls ? (
              <View style={styles.heightControlRow}>
                <TouchableOpacity
                  style={styles.heightBtn}
                  onPress={() =>
                    setTabBarHiddenHeight(
                      Math.max(
                        tabBarDockedHeight || 92,
                        (tabBarHiddenHeight || (tabBarDockedHeight || 92) + 8) -
                          (hiddenHeightStep || 2),
                      ),
                    )
                  }
                >
                  <Text style={styles.heightBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.heightValue}>
                  {tabBarHiddenHeight || (tabBarDockedHeight || 92) + 8}px
                </Text>
                <TouchableOpacity
                  style={styles.heightBtn}
                  onPress={() =>
                    setTabBarHiddenHeight(
                      (tabBarHiddenHeight || (tabBarDockedHeight || 92) + 8) +
                        (hiddenHeightStep || 2),
                    )
                  }
                >
                  <Text style={styles.heightBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={styles.smallOption}
                  onPress={() => openPresetMenu("hidden")}
                >
                  <Text style={styles.smallOptionText}>
                    {getHiddenTemplateLabel(tabBarHiddenHeight || (tabBarDockedHeight || 92) + 8)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {enableAdvancedHeightControls && (
            <View style={[styles.settingRow, { marginTop: spacing.xs }]}>
              <Text style={styles.settingLabel}>Hidden step</Text>
              <View style={styles.optionRow}>
                {[1, 2, 4].map((s) => (
                  <TouchableOpacity
                    key={`hidden-step-${s}`}
                    style={[
                      styles.smallOption,
                      hiddenHeightStep === s && styles.smallOptionSelected,
                    ]}
                    onPress={() => setHiddenHeightStep(s)}
                  >
                    <Text
                      style={[
                        styles.smallOptionText,
                        hiddenHeightStep === s && styles.smallOptionTextSelected,
                      ]}
                    >
                      {s}px
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Floating Height</Text>
            {enableAdvancedHeightControls ? (
              <View style={styles.heightControlRow}>
                <TouchableOpacity
                  style={styles.heightBtn}
                  onPress={() =>
                    setTabBarFloatingHeight(
                      Math.max(48, (tabBarFloatingHeight || 64) - (floatingHeightStep || 2)),
                    )
                  }
                >
                  <Text style={styles.heightBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.heightValue}>{tabBarFloatingHeight || 64}px</Text>
                <TouchableOpacity
                  style={styles.heightBtn}
                  onPress={() =>
                    setTabBarFloatingHeight(
                      (tabBarFloatingHeight || 64) + (floatingHeightStep || 2),
                    )
                  }
                >
                  <Text style={styles.heightBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={styles.smallOption}
                  onPress={() => openPresetMenu("floating")}
                >
                  <Text style={styles.smallOptionText}>
                    {getFloatingTemplateLabel(tabBarFloatingHeight || 64)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {enableAdvancedHeightControls && (
            <View style={[styles.settingRow, { marginTop: spacing.xs }]}>
              <Text style={styles.settingLabel}>Floating step</Text>
              <View style={styles.optionRow}>
                {[1, 2, 4].map((s) => (
                  <TouchableOpacity
                    key={`float-step-${s}`}
                    style={[
                      styles.smallOption,
                      floatingHeightStep === s && styles.smallOptionSelected,
                    ]}
                    onPress={() => setFloatingHeightStep(s)}
                  >
                    <Text
                      style={[
                        styles.smallOptionText,
                        floatingHeightStep === s && styles.smallOptionTextSelected,
                      ]}
                    >
                      {s}px
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Allow content under tab bar</Text>
            <Switch
              value={allowContentUnderTabBar}
              onValueChange={(v) => setAllowContentUnderTabBar(v)}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Badge Style</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.smallOption,
                  tabBadgeStyle === "count" && styles.smallOptionSelected,
                ]}
                onPress={() => setTabBadgeStyle("count")}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabBadgeStyle === "count" && styles.smallOptionTextSelected,
                  ]}
                >
                  Count
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallOption, tabBadgeStyle === "dot" && styles.smallOptionSelected]}
                onPress={() => setTabBadgeStyle("dot")}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabBadgeStyle === "dot" && styles.smallOptionTextSelected,
                  ]}
                >
                  Dot
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallOption, tabBadgeStyle === "none" && styles.smallOptionSelected]}
                onPress={() => setTabBadgeStyle("none")}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabBadgeStyle === "none" && styles.smallOptionTextSelected,
                  ]}
                >
                  None
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Indicator</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.smallOption,
                  tabIndicatorStyle === "bubble" && styles.smallOptionSelected,
                ]}
                onPress={() => setTabIndicatorStyle("bubble")}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabIndicatorStyle === "bubble" && styles.smallOptionTextSelected,
                  ]}
                >
                  Bubble
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.smallOption,
                  tabIndicatorStyle === "underline" && styles.smallOptionSelected,
                ]}
                onPress={() => setTabIndicatorStyle("underline")}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabIndicatorStyle === "underline" && styles.smallOptionTextSelected,
                  ]}
                >
                  Underline
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.smallOption,
                  tabIndicatorStyle === "none" && styles.smallOptionSelected,
                ]}
                onPress={() => setTabIndicatorStyle("none")}
              >
                <Text
                  style={[
                    styles.smallOptionText,
                    tabIndicatorStyle === "none" && styles.smallOptionTextSelected,
                  ]}
                >
                  None
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ACTIVE TABS */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Tabs ({selectedTabs.length}/5)</Text>
            <Text style={styles.sectionDesc}>Tap and hold to reorder • Tap to remove</Text>

            <View style={styles.tabList}>
              {selectedTabs.map((tabId, index) => {
              const tab = getTabInfo(tabId);
              if (!tab) return null;

              return (
                <Pressable
                  key={tabId}
                  style={styles.activeTabRow}
                  onLongPress={() => promptReorder(index)}
                  delayLongPress={180}
                >
                  <View style={styles.dragHandle}>
                    <GripVertical size={20} color={colors.textSecondary} />
                  </View>
                  <View style={styles.tabInfo}>
                    <tab.Icon size={20} color={colors.primary} />
                    <Text style={styles.tabLabel}>{tab.label}</Text>
                  </View>
                  <View style={styles.tabPosition}>
                    <Text style={styles.positionText}>{index + 1}</Text>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => toggleTab(tabId)}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </Pressable>
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
  dragHandle: {
    marginRight: spacing.sm,
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
    color: "#D32F2F",
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
    backgroundColor: "#F0F4F8",
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
    backgroundColor: colors.primary + "10", // 10% opacity
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
    backgroundColor: "#F2F7FB",
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
    color: "#FF6B6B",
    backgroundColor: "#FFE0E0",
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
    backgroundColor: "#f2f4f7",
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
    backgroundColor: "#ff3b30",
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  previewBadgeText: {
    color: "#fff",
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
    fontFamily: typography.fontFamily.serif,
    fontSize: 15,
    fontWeight: "700",
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
    backgroundColor: "#0a84ff",
  },
  previewIndicatorBubble: {
    backgroundColor: "#e6f0ff",
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
    borderBottomColor: "rgba(0,0,0,0.06)",
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
