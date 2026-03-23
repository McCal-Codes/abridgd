/**
 * Profile Screen
 *
 * Profile management with reading stats and account tools.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Share as NativeShare,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  BookOpen,
  Mail,
  Shield,
  Sparkles,
  UploadCloud,
  Download,
  User,
} from "lucide-react-native";
import { GlassButton } from "../components/GlassButton";
import { SignInWithApple } from "../components/SignInWithApple";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { HeroHeader } from "../components/HeroHeader";
import {
  APP_BUILD,
  APP_NAME,
  APP_VERSION,
  BUG_EMAIL_BODY_TEMPLATE,
  BUG_EMAIL_SUBJECT,
  CONTACT_EMAIL,
} from "../config/appInfo";
import { useProfiles, getAchievementStatuses } from "../context/ProfileContext";
import { useReadingProgressOptional } from "../context/ReadingProgressContext";
import { useThemedStyles } from "../theme/useThemedStyles";

const KARMA_TIERS = [
  { label: "Fresh", min: 0 },
  { label: "Warm", min: 50 },
  { label: "Steady", min: 150 },
  { label: "Glowing", min: 300 },
];

const getCurrentKarmaTier = (score: number) => {
  let currentTier = KARMA_TIERS[0];

  KARMA_TIERS.forEach((tier) => {
    if (score >= tier.min) {
      currentTier = tier;
    }
  });

  return currentTier;
};

const formatRelativeDate = (timestamp?: number | null) => {
  if (!timestamp) return "No reads yet";

  const target = new Date(timestamp);
  if (Number.isNaN(target.getTime())) return "No reads yet";

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  ).getTime();
  const diffDays = Math.floor((startOfToday - startOfTarget) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.round(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  return target.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const ProfileScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();

  const {
    activeProfile,
    signInWithAppleProfile,
    signOut,
    exportProfileKey,
    importProfileKey,
    updateSettingsTag,
  } = useProfiles();
  const { readingStats } = useReadingProgressOptional();

  const [settingsTagInput, setSettingsTagInput] = useState(activeProfile?.settingsTag || "");
  const [importCode, setImportCode] = useState("");
  const profileReady = Boolean(activeProfile);

  const achievementStatuses = useMemo(
    () => getAchievementStatuses(activeProfile || undefined),
    [activeProfile],
  );
  const achievementsUnlocked = achievementStatuses.filter((a) => a.earned).length;
  const achievementCopy = `${achievementsUnlocked}/${achievementStatuses.length}`;

  const profileArticlesRead = activeProfile?.stats?.articlesRead || 0;
  const savedActions = activeProfile?.stats?.savedActions || 0;
  const savedCount = activeProfile?.savedArticles?.length || 0;
  const trackedReads = readingStats?.totalArticlesRead ?? 0;
  const articlesInProgress = readingStats?.articlesInProgress ?? 0;
  const totalMinutesRead = Math.round((readingStats?.totalReadTimeSeconds ?? 0) / 60);
  const averageCompletion = Math.round(readingStats?.averageCompletionPercentage ?? 0);
  const derivedArticlesRead = Math.max(profileArticlesRead, trackedReads);
  const articlesReadDisplay = profileReady ? `${derivedArticlesRead}` : "—";
  const inProgressDisplay = profileReady ? `${articlesInProgress}` : "—";
  const readTimeDisplay = profileReady ? `${totalMinutesRead} min` : "—";
  const completionDisplay = profileReady ? `${averageCompletion}%` : "—";
  const savedCountDisplay = profileReady ? `${savedCount}` : "—";
  const karma = derivedArticlesRead * 10 + savedActions * 5 + savedCount * 2;
  const nextTier = KARMA_TIERS.find((tier) => tier.min > karma);
  const currentTier = getCurrentKarmaTier(karma);
  const lastReadDisplay = profileReady ? formatRelativeDate(activeProfile?.stats?.lastReadAt) : "—";
  const lastSavedDisplay = profileReady
    ? formatRelativeDate(activeProfile?.stats?.lastSavedAt)
    : "—";
  const karmaTierLabel = profileReady ? `${currentTier.label} tier` : "—";

  useEffect(() => {
    setSettingsTagInput(activeProfile?.settingsTag || "");
  }, [activeProfile?.settingsTag]);

  const handleSettings = () => navigation.navigate("Settings" as never);

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

  const handleSettingsTagBlur = () => {
    const cleaned = settingsTagInput.trim();
    updateSettingsTag(cleaned || "Local profile");
    setSettingsTagInput(cleaned || "Local profile");
  };

  const handleExportProfile = () => {
    const key = exportProfileKey();
    if (!key) {
      Alert.alert("Export failed", "Could not generate a profile key. Try again.");
      return;
    }
    NativeShare.share({
      message: `Abridgd profile key: ${key}`,
    });
  };

  const handleImportProfile = () => {
    const cleaned = importCode.trim();
    if (!cleaned) return;
    const success = importProfileKey(cleaned);
    if (success) {
      Alert.alert("Imported", "Profile imported and activated.");
      setImportCode("");
    } else {
      Alert.alert("Import failed", "Please check the code and try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerContainer, { paddingTop: spacing.md }]}>
          <HeroHeader title="Profile" subtitle="Reading and account basics" Icon={User} />
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
              <Text style={styles.profileSubtext}>
                {activeProfile?.email || "Signed out"} · Sync coming soon
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {activeProfile?.settingsTag || "Local profile"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profilePillsGrid}>
            <ProfilePill
              label="Reads tracked"
              value={articlesReadDisplay}
              accessibilityLabel={`Reads tracked ${articlesReadDisplay}`}
              style={styles.profilePillHalf}
            />
            <ProfilePill
              label="Saved"
              value={savedCountDisplay}
              accessibilityLabel={`Saved articles ${savedCountDisplay}`}
              style={styles.profilePillHalf}
            />
          </View>

          {!profileReady ? (
            <Text style={styles.noteText}>Loading your profile…</Text>
          ) : (
            <Text style={styles.noteText}>
              Reading stats come from tracked sessions and stay on this device until sync launches.
            </Text>
          )}

          <GlassButton
            label="Open settings"
            prominence="standard"
            onPress={handleSettings}
            accessibilityLabel="Open settings"
            style={styles.cardAction}
          />
          <GlassButton
            label={`View achievements (${achievementCopy})`}
            prominence="tinted"
            onPress={() => navigation.navigate("Achievements" as never)}
            accessibilityLabel="View achievements"
            accessibilityHint="Opens the achievements screen"
            style={styles.cardAction}
            icon={<BookOpen size={16} color={colors.text} strokeWidth={2} />}
          />
          {activeProfile?.appleUserId ? (
            <GlassButton
              label="Sign out"
              prominence="standard"
              onPress={() => {
                const profile = signOut();
                Alert.alert("Signed out", `Switched to ${profile.name}.`);
              }}
              accessibilityLabel="Sign out of Apple account"
              style={styles.cardAction}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Reading" />
          <View style={styles.statGroup}>
            <StatRow
              label="Articles read"
              value={articlesReadDisplay}
              hint="All-time reads on this device"
            />
            <StatRow
              label="In progress"
              value={inProgressDisplay}
              hint="Articles with saved reading progress"
            />
            <StatRow
              label="Read time"
              value={readTimeDisplay}
              hint="Tracked reading minutes on this device"
            />
            <StatRow
              label="Average completion"
              value={completionDisplay}
              hint="Average completion across tracked reads"
            />
            <StatRow label="Last read" value={lastReadDisplay} hint="Relative to today" />
            <StatRow
              label="Last saved"
              value={lastSavedDisplay}
              hint="Most recent save action"
            />
            <StatRow
              label="Karma tier"
              value={karmaTierLabel}
              hint={nextTier ? `${nextTier.label} up next` : "Top tier reached"}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Account & backup" />
          <View style={[styles.card, styles.transferCard]}>
            <View style={styles.connectedRow}>
              <View style={styles.connectedIcon}>
                <Shield size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.connectedTextBlock}>
                <Text style={styles.connectedTitle}>Apple Account</Text>
                <Text style={styles.connectedDesc}>
                  Sync is not live yet. Data stays local until you opt in.
                </Text>
              </View>
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedBadgeText}>Local only</Text>
              </View>
            </View>
            <SignInWithApple
              onSuccess={(user) => {
                const profile = signInWithAppleProfile({
                  id: user.id,
                  email: user.email,
                  displayName: user.displayName,
                });
                Alert.alert("Signed in", `Welcome back, ${profile.name}!`);
              }}
              onError={(error) => {
                console.error("Sign in error:", error);
              }}
            />
            <Text style={styles.sectionDesc}>
              Keep this screen focused on the basics: label this device, keep a backup code handy,
              and import a profile when you need to move settings later.
            </Text>

            <Text style={styles.transferLabel}>Profile label</Text>
            <TextInput
              value={settingsTagInput}
              onChangeText={setSettingsTagInput}
              onBlur={handleSettingsTagBlur}
              placeholder="e.g., iPhone main settings"
              style={styles.textInput}
              accessibilityLabel="Profile settings tag"
              accessibilityHint="Identifies this profile when exporting or importing."
              placeholderTextColor={colors.textSecondary}
              returnKeyType="done"
            />

            <View style={styles.cardDivider} />

            <Text style={styles.transferLabel}>Profile key</Text>
            <Text style={styles.transferCode} selectable>
              {activeProfile?.transferKey || "Unavailable"}
            </Text>
            <GlassButton
              label="Share code"
              prominence="standard"
              onPress={handleExportProfile}
              accessibilityLabel="Share profile code"
              accessibilityHint="Opens the share sheet with your profile code."
              style={styles.cardAction}
              icon={<UploadCloud size={16} color={colors.text} strokeWidth={2} />}
            />

            <TextInput
              value={importCode}
              onChangeText={setImportCode}
              placeholder="Paste profile code to import"
              style={[styles.textInput, styles.secondaryFieldSpacing]}
              accessibilityLabel="Import profile code"
              accessibilityHint="Paste a code to import settings and achievements."
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <GlassButton
              label="Import profile"
              prominence="standard"
              onPress={handleImportProfile}
              accessibilityLabel="Import profile"
              accessibilityHint="Imports the profile using the provided code."
              style={styles.cardAction}
              icon={<Download size={16} color={colors.text} strokeWidth={2} />}
            />
            <GlassButton
              label="Delete local data"
              prominence="standard"
              onPress={() => Alert.alert("Coming soon", "Local data deletion will ship with sync.")}
              accessibilityLabel="Delete local data"
              accessibilityHint="Future control to remove local profile data."
              style={styles.cardAction}
            />
            <Text style={styles.transferHint}>
              Keep this code private. Data consent and granular deletion ship with sync.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Support" />
          <View style={styles.actionsRow}>
            <ActionButton
              label="Send feedback"
              Icon={Mail}
              onPress={handleFeedback}
              accessibilityLabel="Send feedback"
              accessibilityHint="Opens your mail app with a pre-filled report template."
              prominence="standard"
            />
            <ActionButton
              label="Share app"
              Icon={Sparkles}
              onPress={handleShare}
              accessibilityLabel="Share app"
              accessibilityHint="Opens the native share sheet with a link to Abridgd."
              prominence="tinted"
            />
          </View>
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            {APP_NAME} {APP_VERSION} (build {APP_BUILD})
          </Text>
          <Text style={styles.footerTextSecondary}>Support uses this for troubleshooting.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionHeader = ({
  title,
  compact,
  style,
}: {
  title: string;
  compact?: boolean;
  style?: any;
}) => {
  const styles = useThemedStyles(createStyles);
  return (
    <Text style={[styles.sectionTitle, compact && { marginBottom: spacing.sm }, style]}>
      {title}
    </Text>
  );
};

const StatRow = ({
  label,
  value,
  hint,
  isLast,
}: {
  label: string;
  value: string;
  hint?: string;
  isLast?: boolean;
}) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View
      style={[styles.statRow, isLast && styles.statRowLast]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}, ${value}${hint ? `. ${hint}` : ""}`}
    >
      <View style={styles.statRowText}>
        <Text style={styles.statRowLabel} numberOfLines={1} ellipsizeMode="tail">
          {label}
        </Text>
        {hint ? (
          <Text style={styles.statRowHint} numberOfLines={1} ellipsizeMode="tail">
            {hint}
          </Text>
        ) : null}
      </View>
      <Text style={styles.statRowValue} adjustsFontSizeToFit minimumFontScale={0.8}>
        {value}
      </Text>
    </View>
  );
};

const ProfilePill = ({
  label,
  value,
  accessibilityLabel,
  style,
}: {
  label: string;
  value: string;
  accessibilityLabel?: string;
  style?: any;
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View
      style={[styles.profilePill, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || `${label}: ${value}`}
    >
      <Text style={styles.profilePillLabel}>{label}</Text>
      <Text style={styles.profilePillValue} adjustsFontSizeToFit minimumFontScale={0.8}>
        {value}
      </Text>
    </View>
  );
};

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
}) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  return (
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
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  settingsButton: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
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
    padding: spacing.xl + spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
  noteText: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.sans,
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
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  badgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardAction: {
    alignSelf: "stretch",
    marginTop: spacing.sm,
  },
  karmaBadge: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.border,
  },
  karmaBadgeText: {
    color: colors.textSecondary,
  },
  inlineButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
  },
  destructiveSpacing: {
    marginTop: spacing.md,
  },
  statGroup: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statRowLast: {
    borderBottomWidth: 0,
    paddingBottom: spacing.sm,
  },
  statRowText: {
    flex: 1,
  },
  statRowLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  statRowHint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statRowValue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginLeft: spacing.md,
  },
  karmaRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: spacing.lg,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  karmaLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  karmaValue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  karmaHint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFillMuted: {
    height: "100%",
    backgroundColor: `${colors.tint}70`,
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
  textInput: {
    width: "100%",
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.text,
  },
  secondaryFieldSpacing: {
    marginTop: spacing.md,
  },
  cardDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: spacing.lg,
  },
  transferCard: {
    // spacing handled per-child to avoid unsupported gap on React Native
  },
  transferRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    flexWrap: "wrap",
  },
  transferLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  transferCode: {
    fontFamily: typography.fontFamily.mono || typography.fontFamily.sans,
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transferButton: {
    marginTop: spacing.sm,
    marginLeft: spacing.sm,
  },
  transferHint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  footerInfo: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  connectedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  connectedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  connectedTextBlock: {
    flex: 1,
  },
  connectedTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  connectedDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  connectedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  connectedBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureRowLast: {
    borderBottomWidth: 0,
  },
  featureIcon: {
    width: 32,
    alignItems: "center",
  },
  featureTextBlock: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  featureTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  featureDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  featureBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginLeft: spacing.sm,
  },
  featureBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  sheetSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  sheetButton: {
    marginTop: spacing.sm,
  },
  footerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerTextSecondary: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  profilePillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  profilePillHalf: {
    flexBasis: "48%",
  },
  profilePill: {
    flexGrow: 1,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 64,
    justifyContent: "center",
  },
  profilePillLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  profilePillValue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
  },
  });

export default ProfileScreen;
