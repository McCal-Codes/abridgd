/**
 * Profile Screen
 *
 * User profile management with Sign in with Apple option.
 * Shows reading stats and account information.
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { SignInWithApple } from "../components/SignInWithApple";
import { ComingSoon } from "../components/ComingSoon";
import { useProfiles } from "../context/ProfileContext";
import { User, Award, BookOpen } from "lucide-react-native";

export const ProfileScreen: React.FC = () => {
  const { activeProfile } = useProfiles();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Profile</Text>

        {/* Anonymous User State */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User size={48} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.profileName}>{activeProfile?.name || "Anonymous Reader"}</Text>
            <Text style={styles.profileSubtext}>Not signed in</Text>
          </View>
        </View>

        {/* Sign in with Apple */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sign In</Text>
          <Text style={styles.sectionDesc}>
            Sign in to sync your preferences, reading history, and saved articles across devices.
          </Text>
          <SignInWithApple
            onSuccess={(user) => {
              console.log("Sign in successful:", user);
              // TODO: Update profile context with authenticated user
            }}
            onError={(error) => {
              console.error("Sign in error:", error);
            }}
          />
        </View>

        {/* Reading Stats (Mock) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Stats</Text>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <BookOpen size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{activeProfile?.savedArticles?.length || 0}</Text>
              <Text style={styles.statLabel}>Saved Articles</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Award size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Day Reading Streak</Text>
              <Text style={styles.statHint}>Keep reading to build your streak!</Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <ComingSoon
            variant="card"
            title="Export & Privacy"
            description="Data export and account deletion tools are coming soon."
            icon="clock"
          />
        </View>

        <ComingSoon
          variant="banner"
          title="Sign in with Apple"
          description="Authentication is coming soon. Anonymous usage is fully supported."
          icon="sparkles"
        />
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
    marginBottom: spacing.xl,
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
    lineHeight: 20,
  },
  profileCard: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  profileName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileSubtext: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  statLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  statHint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.text,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  comingSoon: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  footer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  footerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
