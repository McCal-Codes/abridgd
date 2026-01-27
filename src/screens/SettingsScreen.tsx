import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  AccessibilityInfo,
  useWindowDimensions,
  Switch,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useSettings } from "../context/SettingsContext";
import { useTheme, Colors } from "../theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONTACT_EMAIL } from "../config/appInfo";
import {
  BookOpen,
  Newspaper,
  HeartPulse,
  Compass,
  Eye,
  Info,
  Bug,
  ChevronRight,
  Zap,
  ListChecks,
  Palette,
  Bell,
  Mail,
} from "lucide-react-native";

type SettingsNavigationProp = NativeStackNavigationProp<any>;

interface SettingsMenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  screen?: string;
  type?: "nav" | "toggle" | "action";
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityHint?: string;
  badge?: string;
}

interface SettingsSection {
  title: string;
  subtitle?: string;
  items: SettingsMenuItem[];
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [devNotificationsEnabled, setDevNotificationsEnabled] = useState(false);
  const { colors } = useTheme();
  const {
    readingSpeed,
    fontSize,
    lineHeight,
    digestSummaryMode,
    dataSaverMode,
    setDataSaverMode,
    imageLoadingMode,
    tabLayout,
    defaultTab,
    showTabLabels,
    setShowTabLabels,
    reduceMotion,
    animationScale,
    groundingAnimationStyle,
    groundingColor,
    isGroundingEnabled,
    shouldShowWhatsNew,
    markVersionSeen,
  } = useSettings();
  const { setColorSchemeOverride, colorScheme } = useTheme();

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotionEnabled);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("devNotificationsEnabled")
      .then((stored) => {
        if (stored !== null) setDevNotificationsEnabled(stored === "true");
      })
      .catch(() => {});
  }, []);

  const rowPaddingVertical = fontScale > 1.15 ? spacing.md : spacing.sm;
  const activeOpacity = reduceMotionEnabled ? 1 : 0.78;
  const themeLabel = () => {
    if (colorScheme === "dark") return "Dark";
    if (colorScheme === "light") return "Light";
    return "System";
  };

  const cycleTheme = () => {
    const next =
      colorScheme === null || colorScheme === "light"
        ? "dark"
        : colorScheme === "dark"
          ? null // back to system
          : "light";
    setColorSchemeOverride(next);
  };

  const resetThemeToSystem = () => setColorSchemeOverride(null);

  const toggleDevNotifications = async (value: boolean) => {
    try {
      setDevNotificationsEnabled(value);
      await AsyncStorage.setItem("devNotificationsEnabled", value.toString());
    } catch {
      // best-effort only
    }
  };

  const openSupportMail = async () => {
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Support request")}`;
    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
      } else {
        Alert.alert("Mail unavailable", "No mail client is available on this device.");
      }
    } catch {
      Alert.alert("Mail unavailable", "Unable to open the mail composer.");
    }
  };

  const sections: SettingsSection[] = [
    {
      title: "Reading & Appearance",
      subtitle: "Text, calm, visuals",
      items: [
        {
          title: "Reading Experience",
          description: "RSVP, font, speed",
          icon: <BookOpen size={24} color={colors.primary} />,
          screen: "ReadingSettings",
          accessibilityHint: "Open reading preferences",
          type: "nav",
        },
        {
          title: "Theme",
          description: "System, Light, Dark",
          icon: <Palette size={24} color={colors.primary} />,
          type: "action",
          onPress: cycleTheme,
          onLongPress: resetThemeToSystem,
          accessibilityHint: "Cycles theme between system, light, and dark",
          badge: themeLabel(),
        },
        {
          title: "Animations",
          description: "Reduce Motion, haptics",
          icon: <Zap size={24} color={colors.primary} />,
          type: "action",
          onPress: () => navigation.navigate("AccessibilitySettings"),
          accessibilityHint: "Open animation and haptics controls",
          badge: reduceMotion ? "Motion Off" : `x${animationScale.toFixed(1)}`,
        },
        {
          title: "Accessibility",
          description: "Motion, pacing",
          icon: <Eye size={24} color={colors.primary} />,
          screen: "AccessibilitySettings",
          accessibilityHint: "Open accessibility options",
          type: "nav",
        },
        {
          title: "Grounding & Focus",
          description: "Breathing, colors",
          icon: <HeartPulse size={24} color={colors.primary} />,
          screen: "GroundingFocusSettings",
          accessibilityHint: "Open grounding and focus options",
          type: "nav",
        },
      ],
    },
    {
      title: "Content & Delivery",
      subtitle: "Sources, digest, performance",
      items: [
        {
          title: "Digest & Launch",
          description: "Welcome back, default tab",
          icon: <Newspaper size={24} color={colors.primary} />,
          screen: "DigestSettings",
          accessibilityHint: "Open digest and launch preferences",
          type: "nav",
        },
        {
          title: "News Sources",
          description: "Choose feeds and RSS",
          icon: <ListChecks size={24} color={colors.primary} />,
          screen: "SourcesSettings",
          accessibilityHint: "Open news source controls",
          type: "nav",
        },
        {
          title: "Data & Performance",
          description: "Images, battery, data saver",
          icon: <Zap size={24} color={colors.primary} />,
          type: "toggle",
          value: dataSaverMode,
          onToggle: setDataSaverMode,
          screen: "DataPerformanceSettings",
          accessibilityHint: "Toggle data saver and open performance settings",
        },
        {
          title: "Notifications (Dev)",
          description: "Dev toggle only",
          icon: <Bell size={24} color={colors.primary} />,
          type: "toggle",
          value: devNotificationsEnabled,
          onToggle: toggleDevNotifications,
          accessibilityHint: "Development-only notification toggle",
        },
      ],
    },
    {
      title: "Navigation",
      subtitle: "Tabs, layout, entry points",
      items: [
        {
          title: "Navigation",
          description: "Tab Bar Studio, layout",
          icon: <Compass size={24} color={colors.primary} />,
          screen: "NavigationSettings",
          accessibilityHint: "Open navigation and tab bar settings",
          type: "nav",
        },
        {
          title: "Show Tab Labels",
          description: "Toggle tab text",
          icon: <Compass size={24} color={colors.primary} />,
          type: "toggle",
          value: showTabLabels,
          onToggle: setShowTabLabels,
          accessibilityHint: "Toggle tab labels on or off",
        },
      ],
    },
    {
      title: "Support",
      subtitle: "Help, feedback, and about",
      items: [
        {
          title: "Email Support",
          description: "Open mail to contact us",
          icon: <Mail size={24} color={colors.primary} />,
          type: "action",
          onPress: openSupportMail,
          accessibilityHint: "Opens mail composer to contact support",
        },
        {
          title: "App Info",
          description: "Version, policies, feedback",
          icon: <Info size={24} color={colors.primary} />,
          screen: "AppInfo",
          accessibilityHint: "Open app info and support",
          type: "nav",
          badge: shouldShowWhatsNew ? "New" : undefined,
          onPress: () => {
            if (shouldShowWhatsNew) markVersionSeen();
            navigation.navigate("AppInfo" as never);
          },
        },
      ],
    },
    {
      title: "Advanced",
      subtitle: "Developer tools and diagnostics",
      items: [
        {
          title: "Debug & Advanced",
          description: "Developer tools and diagnostics",
          icon: <Bug size={24} color={colors.primary} />,
          screen: "DebugSettings",
          accessibilityHint: "Open debug and advanced options",
        },
      ],
    },
  ];

  const getStatus = (screen: string): string | undefined => {
    switch (screen) {
      case "DigestSettings":
        return digestSummaryMode === "ai-summary"
          ? "AI summary"
          : digestSummaryMode === "headline-only"
            ? "Headlines"
            : "Fact-based";
      case "DataPerformanceSettings":
        if (dataSaverMode) return "Data Saver on";
        if (imageLoadingMode === "compressed") return "Images: Compressed";
        if (imageLoadingMode === "text-only") return "Text only";
        return "Images: Full";
      case "ReadingSettings":
        return `${readingSpeed} wpm • Font ${fontSize.toFixed(1)}x • Line ${lineHeight.toFixed(1)}x`;
      case "GroundingFocusSettings":
        return isGroundingEnabled
          ? `Style: ${humanize(groundingAnimationStyle)} • ${groundingColor}`
          : "Off";
      case "NavigationSettings":
        return `${humanize(tabLayout)} • Default ${humanize(defaultTab)}`;
      case "AccessibilitySettings":
        return reduceMotion ? "Reduce Motion on" : `Animations x${animationScale.toFixed(1)}`;
      case "Theme":
        return themeLabel();
      default:
        return undefined;
    }
  };

  const humanize = (value: string) =>
    value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.xl + Math.max(insets.bottom, spacing.lg) },
        ]}
      >
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.description}>Customize your news reading experience</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryLabel }]}>
              {section.title}
            </Text>
            {section.subtitle ? (
              <Text style={[styles.sectionSubtitle, { color: colors.secondaryLabel }]}>
                {section.subtitle}
              </Text>
            ) : null}

            <View
              style={[
                styles.menuContainer,
                { backgroundColor: colors.surface, borderColor: colors.separator },
              ]}
            >
              {section.items.map((item, index) => {
                const status = getStatus(item.screen || item.title);
                return (
                  <TouchableOpacity
                    key={item.screen || item.title}
                    style={[
                      styles.menuItem,
                      index === section.items.length - 1 && styles.lastMenuItem,
                      { paddingHorizontal: spacing.md, paddingVertical: rowPaddingVertical },
                      section.title === "Advanced" ? styles.advancedBackground : null,
                    ]}
                    onPress={
                      item.type === "toggle"
                        ? undefined
                        : item.onPress
                          ? item.onPress
                          : item.screen
                            ? () => navigation.navigate(item.screen as never)
                            : undefined
                    }
                    onLongPress={item.onLongPress}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                    accessibilityHint={item.accessibilityHint || `Opens ${item.title}`}
                    activeOpacity={activeOpacity}
                  >
                    <View style={styles.iconContainer}>{item.icon}</View>
                  <View style={styles.menuTextContainer}>
                    <Text
                      style={[styles.menuTitle, { color: colors.text }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.menuDescription, { color: colors.textSecondary }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.description}
                    </Text>
                  </View>
                    {item.type === "toggle" && item.value !== undefined && item.onToggle ? (
                      <Switch
                        accessibilityLabel={`${item.title} toggle`}
                        value={item.value}
                        onValueChange={item.onToggle}
                        thumbColor={item.value ? colors.tint : colors.secondaryBackground}
                        trackColor={{ true: colors.tintTransparent, false: colors.separator }}
                      />
                    ) : null}
                    {item.badge ? (
                      <View
                        style={[
                          styles.statusChip,
                          { backgroundColor: colors.tintTransparent, borderColor: colors.separator },
                        ]}
                      >
                        <Text
                          style={[styles.statusChipText, { color: colors.tint }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.badge}
                        </Text>
                      </View>
                    ) : null}
                    {status && !item.badge ? (
                      <View
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: colors.tintTransparent,
                            borderColor: colors.separator,
                          },
                        ]}
                        accessible
                        accessibilityLabel={`${item.title} status ${status}`}
                      >
                        <Text
                          style={[styles.statusChipText, { color: colors.tint }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {status}
                        </Text>
                      </View>
                    ) : null}
                    <ChevronRight size={20} color={colors.secondaryLabel} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) =>
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
    menuContainer: {
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: "hidden",
      backgroundColor: colors.surface,
      borderColor: colors.separator,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
      gap: spacing.sm,
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
      backgroundColor: colors.secondaryBackground,
    },
    menuTextContainer: {
      flex: 1,
      minWidth: 0, // allow ellipsis
    },
    menuTitle: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
      lineHeight: 20,
      flexShrink: 1,
      flexWrap: "wrap",
    },
  menuDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
    flexWrap: "wrap",
  },
    statusChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      marginLeft: spacing.sm,
      maxWidth: "42%",
    },
    statusChipText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      fontWeight: "600",
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 14,
      marginBottom: spacing.xs,
      letterSpacing: 0.2,
      textTransform: "uppercase",
      color: colors.secondaryLabel,
    },
    sectionSubtitle: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      marginBottom: spacing.sm,
      lineHeight: 18,
      color: colors.secondaryLabel,
    },
    advancedBackground: {
      backgroundColor: colors.secondaryBackground,
      opacity: 0.96,
    },
  });
