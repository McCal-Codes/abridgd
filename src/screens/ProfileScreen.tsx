/**
 * Profile Screen
 *
 * User profile management with Sign in with Apple option.
 * Shows reading stats and account information.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share as NativeShare,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { SignInWithApple } from "../components/SignInWithApple";
import { ComingSoon } from "../components/ComingSoon";
import { useProfiles } from "../context/ProfileContext";
import { User, BookOpen, Flame, Settings, MessageCircle, Share, Shield } from "lucide-react-native";
import { GlassButton } from "../components/GlassButton";
import {
  APP_NAME,
  APP_VERSION,
  APP_BUILD,
  CONTACT_EMAIL,
  BUG_EMAIL_SUBJECT,
  BUG_EMAIL_BODY_TEMPLATE,
} from "../config/appInfo";

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeProfile, trackArticleRead, trackSavedAction } = useProfiles();

  const handleFeedback = async () => {
    try {
      const subject = BUG_EMAIL_SUBJECT;
      const body = BUG_EMAIL_BODY_TEMPLATE;
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
      } else {
        Alert.alert("No mail app", "No mail client is available on this device.");
      }
    } catch {
      Alert.alert("Error", "Unable to open mail composer.");
    }
  };

  const handleShare = async () => {
    try {
      await NativeShare.share({
        message: `Try ${APP_NAME} — calm, Pittsburgh-focused news with RSVP reading. (${APP_VERSION} build ${APP_BUILD})`,
        url: "https://abridgd.app",
      });
    } catch {
      Alert.alert("Error", "Unable to open share sheet.");
    }
  };
  const handleSettings = () => navigation.navigate("Settings" as never);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Profile</Text>
          <Text style={styles.subheader}>Your calm hub for stats and settings</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <User size={46} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
            <View style={styles.profileTextBlock}>
              <Text style={styles.profileName}>{activeProfile?.name || "Anonymous Reader"}</Text>
              <Text style={styles.profileSubtext}>
                Codename: {activeProfile?.codename || "Generating…"}
              </Text>
              <Text style={styles.profileSubtext}>Signed out · Sync coming soon</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Local profile</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Reading stats" />
          <View style={styles.statGrid}>
            <StatPill label="This week" value="0" />
            <StatPill label="This month" value="0" />
            <StatPill label="All time" value={`${activeProfile?.savedArticles?.length || 0}`} />
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Flame size={24} color={colors.tint} strokeWidth={2} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>0 days</Text>
              <Text style={styles.statLabel}>Reading streak</Text>
              <Text style={styles.statHint}>Read today to start your streak.</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <BookOpen size={24} color={colors.tint} strokeWidth={2} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{activeProfile?.savedArticles?.length || 0}</Text>
              <Text style={styles.statLabel}>Saved articles</Text>
              <Text style={styles.statHint}>Saved items sync will use Sign in with Apple.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick actions" />
          <View style={styles.actionsRow}>
            <ActionButton
              label="Settings"
              Icon={Settings}
              onPress={handleSettings}
              accessibilityLabel="Open Settings"
              accessibilityHint="Opens app settings including reading and customization options."
              prominence="filled"
            />
            <ActionButton
              label="Send feedback"
              Icon={MessageCircle}
              onPress={handleFeedback}
              accessibilityLabel="Send feedback"
              accessibilityHint="Opens your mail app with a pre-filled report template."
              prominence="standard"
            />
            <ActionButton
              label="Share app"
              Icon={Share}
              onPress={handleShare}
              accessibilityLabel="Share app"
              accessibilityHint="Opens the native share sheet with a link to Abridgd."
              prominence="tinted"
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Sync & privacy" />
          <View style={styles.card}>
            <Text style={styles.sectionDesc}>
              Sign in with Apple will sync preferences, history, and saved articles when it launches.
            </Text>
            <SignInWithApple
              onSuccess={(user) => {
                console.log("Sign in successful:", user);
              }}
              onError={(error) => {
                console.error("Sign in error:", error);
              }}
            />
            <View style={styles.noticeRow}>
              <Shield size={18} color={colors.textSecondary} />
              <Text style={styles.noticeText}>
                No tracking. Data stays on-device until you opt in.
              </Text>
            </View>
          </View>

          <View style={[styles.card, { marginTop: spacing.md }]}>
            <SectionHeader title="Data controls" compact />
            <ComingSoon
              variant="card"
              title="Export & privacy"
              description="Export, delete data, and manage consent will land with sync."
              icon="clock"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionHeader = ({ title, compact }: { title: string; compact?: boolean }) => (
  <Text style={[styles.sectionTitle, compact && { marginBottom: spacing.sm }]}>{title}</Text>
);

const StatPill = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statPill}>
    <Text style={styles.statPillValue}>{value}</Text>
    <Text style={styles.statPillLabel}>{label}</Text>
  </View>
);

const ActionButton = ({
  label,
  Icon,
  onPress,
  accessibilityLabel,
  prominence = "standard",
  accessibilityHint,
}: {
  label: string;
  Icon: typeof User;
  onPress: () => void;
  accessibilityLabel: string;
  prominence?: "standard" | "filled" | "tinted";
  accessibilityHint?: string;
}) => (
  <GlassButton
    label={label}
    prominence={prominence}
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
    style={styles.actionButton}
    icon={<Icon size={18} color={colors.text} strokeWidth={2} />}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  headerRow: {
    marginBottom: spacing.xl,
  },
  header: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
  },
  subheader: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  card: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  profileTextBlock: { flex: 1, marginLeft: spacing.md },
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
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  badgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  statGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  statPill: {
    flexBasis: "31%",
    flexGrow: 1,
    minWidth: 140,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  statPillValue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  statPillLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    flexWrap: "wrap",
  },
  actionButton: {
    width: "48%",
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  noticeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
