import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
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
} from "lucide-react-native";

type SettingsNavigationProp = NativeStackNavigationProp<any>;

interface SettingsMenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  screen: string;
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);

  const menuItems: SettingsMenuItem[] = [
    {
      title: "Reading Experience",
      description: "RSVP, font, speed, focus, sources",
      icon: <BookOpen size={24} color={colors.primary} />,
      screen: "ReadingSettings",
    },
    {
      title: "Data & Performance",
      description: "Image quality, battery, data saver",
      icon: <Zap size={24} color={colors.primary} />,
      screen: "DataPerformanceSettings",
    },
    {
      title: "Digest & Launch",
      description: "Welcome back, default tab, summary style",
      icon: <Newspaper size={24} color={colors.primary} />,
      screen: "DigestSettings",
    },
    {
      title: "Grounding & Focus",
      description: "Breathing, colors, animation style",
      icon: <HeartPulse size={24} color={colors.primary} />,
      screen: "GroundingFocusSettings",
    },
    {
      title: "Navigation",
      description: "How you move; entry to Tab Bar Studio",
      icon: <Compass size={24} color={colors.primary} />,
      screen: "NavigationSettings",
    },
    {
      title: "Accessibility",
      description: "Reduce motion, animation pacing",
      icon: <Eye size={24} color={colors.primary} />,
      screen: "AccessibilitySettings",
    },
    {
      title: "App Info",
      description: "Version, policies, feedback, tutorials",
      icon: <Info size={24} color={colors.primary} />,
      screen: "AppInfo",
    },
    {
      title: "Debug & Advanced",
      description: "Developer tools and diagnostics",
      icon: <Bug size={24} color={colors.primary} />,
      screen: "DebugSettings",
    },
  ];

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

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.menuItem, index === menuItems.length - 1 && styles.lastMenuItem]}
              onPress={() => navigation.navigate(item.screen)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.description}`}
              accessibilityHint={`Opens ${item.title}`}
              activeOpacity={0.78}
            >
              <View style={styles.iconContainer}>{item.icon}</View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
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
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.secondaryBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.lg,
  },
  });
