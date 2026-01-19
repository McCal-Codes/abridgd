import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { GlassButton } from "../components/GlassButton";
import { NavigationHeader } from "../components/NavigationHeader";
import {
  BottomToolbar,
  ToolbarItem,
  ToolbarSpacer,
  ToolbarItemGroup,
} from "../components/BottomToolbar";
import { ZoomModal } from "../components/ZoomModal";
import { BlurSheet } from "../components/BlurSheet";
import {
  Info,
  Trash,
  Plus,
  Share,
  Pencil,
  Download,
  X,
  Check,
  ChevronLeft,
  Play,
  Pause,
  Music2,
  Activity,
  Bell,
  Home,
  Bookmark,
  User2,
  Wifi,
  Moon,
  BookOpen,
  Vibrate,
} from "lucide-react-native";

/**
 * Demo screen showcasing iOS 26-inspired UI components:
 * - Glass buttons with prominence styles
 * - Navigation header with subtitle
 * - Bottom toolbar with spacers and groups
 * - Zoom modal transition
 * - Blur sheet with dynamic transparency
 */
// React Navigation warns if component name is not capitalized; keep leading caps.
type QuickToggleKey = "wifi" | "focus" | "reader" | "haptics";

export const IOS26DemoScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showBlurSheet, setShowBlurSheet] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [activeTabPreview, setActiveTabPreview] = useState("home");
  const [liveState, setLiveState] = useState<"idle" | "playing" | "paused" | "ended">(
    "idle",
  );
  const [liveElapsed, setLiveElapsed] = useState(0);
  const liveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [toggles, setToggles] = useState<Record<QuickToggleKey, boolean>>({
    wifi: true,
    focus: false,
    reader: true,
    haptics: true,
  });

  const infoButtonRef = useRef<View>(null);

  const clearLiveTimer = () => {
    if (liveTimerRef.current) {
      clearInterval(liveTimerRef.current);
      liveTimerRef.current = null;
    }
  };

  const startLiveActivity = () => {
    if (liveTimerRef.current) return;
    setLiveState("playing");
    liveTimerRef.current = setInterval(() => {
      setLiveElapsed((prev) => {
        if (prev >= 120) {
          clearLiveTimer();
          setLiveState("ended");
          return 120;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const pauseLiveActivity = () => {
    clearLiveTimer();
    setLiveState((state) => (state === "playing" ? "paused" : state));
  };

  const resetLiveActivity = () => {
    clearLiveTimer();
    setLiveElapsed(0);
    setLiveState("idle");
  };

  useEffect(() => {
    return () => clearLiveTimer();
  }, []);

  const liveProgress = Math.min(liveElapsed / 120, 1);
  const liveMinutes = Math.floor(liveElapsed / 60)
    .toString()
    .padStart(2, "0");
  const liveSeconds = (liveElapsed % 60).toString().padStart(2, "0");

  const tabPreviewItems = [
    { key: "home", label: "Home", Icon: Home },
    { key: "saved", label: "Saved", Icon: Bookmark },
    { key: "alerts", label: "Alerts", Icon: Bell },
    { key: "profile", label: "You", Icon: User2 },
  ];

  const smartStack = [
    {
      title: "Reading Focus",
      detail: "45 min, ambient",
      accent: colors.primary,
      icon: <Activity size={16} color={colors.background} />,
    },
    {
      title: "Listen Later",
      detail: "8 queued articles",
      accent: colors.accent || colors.primary,
      icon: <Music2 size={16} color={colors.background} />,
    },
    {
      title: "Quiet Alerts",
      detail: "Digest at 7pm",
      accent: colors.text,
      icon: <Bell size={16} color={colors.background} />,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Navigation Header with Back Button */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerBackBtn}>
            <GlassButton
              label="Back"
              icon={<ChevronLeft size={18} color={colors.text} />}
              onPress={() => navigation.goBack()}
              prominence="standard"
            />
          </View>
        </View>
        <NavigationHeader
          title="iOS 26 Features"
          subtitle="Glass buttons, toolbars, and transitions"
          titleAlign="left"
          large
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: showToolbar ? 120 : 40 }]}
      >
        {/* Glass Button Prominence Styles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Glass Button Styles</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Similar to SwiftUI toolbar buttons with glass material
          </Text>

          <View style={styles.buttonGroup}>
            <GlassButton
              label="Standard"
              icon={<Info size={20} color={colors.text} />}
              onPress={() => console.log("Standard pressed")}
              prominence="standard"
            />
            <GlassButton
              label="Tinted"
              icon={<Share size={20} color={colors.primary} />}
              onPress={() => console.log("Tinted pressed")}
              prominence="tinted"
            />
            <GlassButton
              label="Filled"
              icon={<Check size={20} color={colors.background} />}
              onPress={() => console.log("Filled pressed")}
              prominence="filled"
            />
            <GlassButton
              label="Destructive"
              icon={<Trash size={20} color={colors.error} />}
              onPress={() => console.log("Destructive pressed")}
              prominence="standard"
              destructive
            />
          </View>
        </View>

        {/* Zoom Modal Demo */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Zoom Modal Transition</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Modal zooms from source button (matchGeometry effect)
          </Text>

          <View ref={infoButtonRef}>
            <GlassButton
              label="Open Info Modal"
              icon={<Info size={20} color={colors.text} />}
              onPress={() => setShowZoomModal(true)}
              prominence="tinted"
            />
          </View>
        </View>

        {/* Blur Sheet Demo */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bottom Sheet with Blur</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Transparent at medium detent, opaque when expanded
          </Text>

          <GlassButton
            label="Open Sheet"
            icon={<Pencil size={20} color={colors.text} />}
            onPress={() => setShowBlurSheet(true)}
            prominence="standard"
          />
        </View>

        {/* Bottom Toolbar Demo */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bottom Toolbar</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Glass buttons with fixed and flexible spacers
          </Text>

          <GlassButton
            label={showToolbar ? "Hide Toolbar" : "Show Toolbar"}
            onPress={() => setShowToolbar(!showToolbar)}
            prominence="filled"
          />
        </View>

        {/* Live Activity Capsule */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Activity Capsule</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Lock screen style progress with inline controls
          </Text>

          <View
            style={[styles.liveActivity, { backgroundColor: colors.secondaryBackground }]}
            accessibilityRole="summary"
            accessibilityLabel={`Reading timer ${liveMinutes}:${liveSeconds}`}>
            <View style={styles.liveRow}>
              <View style={styles.liveIconWrap}>
                <GlassButton
                  label={liveState === "playing" ? "Pause" : "Play"}
                  icon={
                    liveState === "playing" ? (
                      <Pause size={16} color={colors.text} />
                    ) : (
                      <Play size={16} color={colors.text} />
                    )
                  }
                  onPress={liveState === "playing" ? pauseLiveActivity : startLiveActivity}
                  prominence="tinted"
                  compact
                />
              </View>

              <View style={styles.liveMeta}>
                <Text style={[styles.liveTitle, { color: colors.text }]}>Deep Reading</Text>
                <Text style={[styles.liveSubtitle, { color: colors.textSecondary }]}>
                  {liveState === "playing"
                    ? "Now playing"
                    : liveState === "paused"
                      ? "Paused"
                      : liveState === "ended"
                        ? "Session ended"
                        : "Ready"}
                  {" • "}
                  {liveMinutes}:{liveSeconds}
                </Text>

                <View
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityValue={{ now: Math.round(liveProgress * 100), min: 0, max: 100 }}
                  style={[styles.liveProgressTrack, { backgroundColor: colors.border }]}
                >
                  <View
                    style={[
                      styles.liveProgressFill,
                      {
                        width: `${Math.max(liveProgress * 100, 6)}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={resetLiveActivity}
                accessibilityRole="button"
                style={styles.liveReset}
              >
                <Text style={[styles.liveResetText, { color: colors.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Smart Stack */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Smart Stack Peek</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Layered cards with subtle elevation, similar to iOS 26 widgets
          </Text>

          <View style={styles.stackContainer}>
            {smartStack.map((item, index) => (
              <View
                key={item.title}
                style={[
                  styles.stackCard,
                  {
                    top: index * 10,
                    backgroundColor: colors.secondaryBackground,
                    shadowOpacity: 0.08 + index * 0.02,
                  },
                ]}
              >
                <View style={[styles.stackTag, { backgroundColor: item.accent }]}>{item.icon}</View>
                <View style={styles.stackText}>
                  <Text style={[styles.stackTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.stackSubtitle, { color: colors.textSecondary }]}>
                    {item.detail}
                  </Text>
                </View>
                <GlassButton
                  label="Open"
                  prominence="standard"
                  compact
                  onPress={() => console.log(`Open ${item.title}`)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Floating Tab Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Floating Tab Preview</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Capsule bar with dynamic indicator and badges
          </Text>

          <View
            style={[styles.tabPreview, { backgroundColor: colors.secondaryBackground }]}
            accessibilityRole="tablist"
          >
            {tabPreviewItems.map(({ key, label, Icon }) => {
              const isActive = activeTabPreview === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.tabButton}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => setActiveTabPreview(key)}
                >
                  <View
                    style={[
                      styles.tabIconWrapper,
                      {
                        backgroundColor: isActive
                          ? colors.primary
                          : "rgba(0,0,0,0.05)",
                      },
                    ]}
                  >
                    <Icon size={16} color={isActive ? colors.background : colors.text} />
                  </View>
                  <Text style={[styles.tabLabel, { color: isActive ? colors.text : colors.textSecondary }]}>
                    {label}
                  </Text>
                  {key === "saved" ? (
                    <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.tabBadgeText, { color: colors.background }]}>3</Text>
                    </View>
                  ) : null}
                  {isActive ? <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Toggles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Toggles</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Control Center tiles with glass surfaces and active tint
          </Text>

          <View style={styles.toggleGrid}>
            {[
              { key: "wifi" as QuickToggleKey, label: "Wi‑Fi", Icon: Wifi },
              { key: "focus" as QuickToggleKey, label: "Focus", Icon: Moon },
              { key: "reader" as QuickToggleKey, label: "Reader", Icon: BookOpen },
              { key: "haptics" as QuickToggleKey, label: "Haptics", Icon: Vibrate },
            ].map(({ key, label, Icon }) => {
              const isOn = toggles[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.toggleTile,
                    {
                      backgroundColor: isOn
                        ? colors.primary
                        : colors.secondaryBackground,
                    },
                  ]}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: isOn }}
                  onPress={() =>
                    setToggles((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                >
                  <Icon size={20} color={isOn ? colors.background : colors.text} />
                  <Text
                    style={[
                      styles.toggleLabel,
                      { color: isOn ? colors.background : colors.text },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Toolbar with Glass Buttons */}
      <BottomToolbar visible={showToolbar} blur>
        <ToolbarItem>
          <GlassButton
            label="Delete"
            icon={<Trash size={18} color={colors.error} />}
            onPress={() => console.log("Delete")}
            prominence="standard"
            destructive
          />
        </ToolbarItem>

        <ToolbarSpacer spacing="flexible" />

        <ToolbarItemGroup gap={12}>
          <GlassButton
            label="New"
            icon={<Plus size={18} color={colors.text} />}
            onPress={() => console.log("New")}
            prominence="standard"
          />
          <GlassButton
            label="Download"
            icon={<Download size={18} color={colors.text} />}
            onPress={() => console.log("Download")}
            prominence="standard"
          />
        </ToolbarItemGroup>
      </BottomToolbar>

      {/* Zoom Modal */}
      <ZoomModal
        visible={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        sourceRef={infoButtonRef}
        blur
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Information</Text>
            <GlassButton
              label="Close"
              icon={<X size={18} color={colors.text} />}
              onPress={() => setShowZoomModal(false)}
              prominence="standard"
            />
          </View>
          <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
            This modal zooms from the button that triggered it, similar to SwiftUI's
            .navigationTransition(.zoom) with .matchTransitionSource modifier.
          </Text>
          <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
            The animation uses react-native-reanimated for smooth spring physics.
          </Text>
        </View>
      </ZoomModal>

      {/* Blur Sheet */}
      <BlurSheet
        visible={showBlurSheet}
        onClose={() => setShowBlurSheet(false)}
        detents={["medium", "large"]}
        initialDetent="medium"
        blur
      >
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Dynamic Blur Sheet</Text>
          <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
            This bottom sheet shows transparency at the medium detent and becomes opaque when
            expanded to full height.
          </Text>
          <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
            Drag up to expand or down to dismiss. Similar to iOS 26 sheet presentation detents with
            background blur.
          </Text>

          <View style={styles.sheetActions}>
            <GlassButton label="Done" onPress={() => setShowBlurSheet(false)} prominence="filled" />
          </View>
        </View>
      </BlurSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerBackBtn: {
    width: 96,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  sectionDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 22,
  },
  buttonGroup: {
    gap: 12,
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 24,
    fontWeight: "700",
  },
  modalBody: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  sheetContent: {
    paddingVertical: 20,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  sheetBody: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  sheetActions: {
    marginTop: 24,
  },
  liveActivity: {
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveIconWrap: {
    width: 64,
  },
  liveMeta: {
    flex: 1,
    gap: 8,
  },
  liveTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 18,
    fontWeight: "700",
  },
  liveSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
  },
  liveProgressTrack: {
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
  },
  liveProgressFill: {
    height: "100%",
    borderRadius: 6,
  },
  liveReset: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveResetText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
  },
  stackContainer: {
    height: 200,
    justifyContent: "flex-start",
  },
  stackCard: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  stackTag: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stackText: {
    flex: 1,
  },
  stackTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 16,
    fontWeight: "700",
  },
  stackSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
  },
  tabPreview: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  tabIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
  },
  tabBadge: {
    position: "absolute",
    top: -2,
    right: 18,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -6,
    height: 4,
    borderRadius: 6,
    width: "70%",
  },
  toggleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  toggleTile: {
    width: "47%",
    minHeight: 72,
    borderRadius: 16,
    padding: 14,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  toggleLabel: {
    marginTop: 8,
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
  },
});
