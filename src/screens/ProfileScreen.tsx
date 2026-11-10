/**
 * Profile Screen
 *
 * Profile management with reading stats and account tools.
 */

import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react-native";
import { Skeleton } from "../components/Skeleton";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { HeroHeader } from "../components/HeroHeader";
import { useProfiles, getAchievementStatuses } from "../context/ProfileContext";
import { useReadingProgressOptional } from "../context/ReadingProgressContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { getAvatarColor, getInitials } from "../utils/avatar";

/** Avatar fills are mid-tone in both themes, so initials stay white rather than following the
 *  theme background (which turned them near-black on the red avatar in dark mode). */
const AVATAR_TEXT = "#FFFFFF";

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
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { tabBarStyle, tabBarDockedHeight, tabBarFloatingHeight } = useSettings();

  /**
   * Every other tab screen clears the floating tab bar; Profile used a static
   * 72pt, which is less than the bar's own height before insets. Its version
   * footer and danger-zone copy sat permanently behind the bar.
   */
  const tabBarClearance =
    (tabBarStyle === "floating" ? tabBarFloatingHeight || 64 : tabBarDockedHeight || 92) +
    insets.bottom +
    spacing.lg;

  const { activeProfile } = useProfiles();
  const { readingStats } = useReadingProgressOptional();

  const [statsOpen, setStatsOpen] = useState(false);
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

  const handleSettings = () => navigation.navigate("Settings" as never);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <HeroHeader title="Profile" subtitle="Your reading, kept on this device" Icon={User} />
        </View>

        <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            {profileReady ? (
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: getAvatarColor(activeProfile?.id), borderColor: "transparent" },
                ]}
              >
                {getInitials(activeProfile?.name) ? (
                  <Text style={styles.avatarInitials}>{getInitials(activeProfile?.name)}</Text>
                ) : (
                  <User size={28} color={AVATAR_TEXT} strokeWidth={1.5} />
                )}
              </View>
            ) : (
              <Skeleton width={56} height={56} borderRadius={28} />
            )}
            <View style={styles.profileTextBlock}>
              {profileReady ? (
                <>
                  <Text style={styles.profileName}>{activeProfile?.name || "Reader"}</Text>
                  <Text style={styles.profileSubtext}>
                    {activeProfile?.codename ? `${activeProfile.codename} · ` : ""}
                    {activeProfile?.appleUserId
                      ? `Signed in with Apple${activeProfile?.email ? ` · ${activeProfile.email}` : ""}`
                      : "local only"}
                  </Text>
                </>
              ) : (
                <>
                  <Skeleton width="70%" height={20} style={{ marginBottom: spacing.xs }} />
                  <Skeleton width="50%" height={14} style={{ marginBottom: spacing.xs }} />
                  <Skeleton width="60%" height={14} />
                </>
              )}
            </View>
          </View>

          <View style={styles.profilePillsGrid}>
            {profileReady ? (
              <>
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
              </>
            ) : (
              <>
                <Skeleton height={64} borderRadius={12} style={styles.profilePillHalf} />
                <Skeleton height={64} borderRadius={12} style={styles.profilePillHalf} />
              </>
            )}
          </View>

        </View>

        <View style={styles.navGroup}>
          <NavRow
            label={`View achievements (${achievementCopy})`}
            accessibilityLabel="View achievements"
            accessibilityHint="Opens the achievements screen"
            onPress={() => navigation.navigate("Achievements" as never)}
            primary
          />
          <NavRow
            label="Reading stats"
            accessibilityLabel="Reading stats"
            accessibilityHint={statsOpen ? "Hides your reading stats" : "Shows your reading stats"}
            onPress={() => setStatsOpen((open) => !open)}
            expanded={statsOpen}
          />
          {statsOpen ? <View style={styles.statGroup}>
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
          </View> : null}
          <NavRow
            label="Account and backup"
            accessibilityLabel="Account and backup"
            accessibilityHint="Opens sign in, backup, support and delete data"
            onPress={() => navigation.navigate("Account" as never)}
          />
          <NavRow
            label="Settings"
            accessibilityLabel="Open settings"
            accessibilityHint="Opens app settings"
            onPress={handleSettings}
          />
          <NavRow
            label="Resources"
            accessibilityLabel="Resources"
            accessibilityHint="Opens crisis lines and local services"
            onPress={() => navigation.navigate("Resources" as never)}
          />
        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const NavRow = ({
  label,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  primary,
  expanded,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  primary?: boolean;
  /** Set on rows that expand in place; shows a down chevron and exposes the state. */
  expanded?: boolean;
}) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const Chevron = expanded ? ChevronDown : ChevronRight;
  const fg = primary ? colors.onTintStrong : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      style={({ pressed }) => [
        styles.navRow,
        primary && styles.navRowPrimary,
        pressed && styles.navRowPressed,
      ]}
    >
      <Text style={[styles.navRowLabel, { color: fg }]} maxFontSizeMultiplier={1.5}>
        {label}
      </Text>
      <Chevron size={18} color={primary ? colors.onTintStrong : colors.textSecondary} strokeWidth={2} />
    </Pressable>
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
  // HeroHeader pads itself by the gutter, so the scroll content stays unpadded and the rest of
  // the screen sits in `body`. Padding both indented the title twice (x=85 vs 43 on Home).
  content: {
    paddingBottom: spacing.xxl + spacing.lg,
  },
  body: {
    paddingHorizontal: spacing.gutter,
  },
  navGroup: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  navRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  navRowPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  navRowPressed: {
    opacity: 0.8,
  },
  navRowLabel: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
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
    // 20pt inside the card, matching the 16pt screen gutter and the nav rows' 16pt inset.
    // This was 40pt, which squeezed every card's content into a narrow column.
    padding: spacing.md + spacing.xs,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarInitials: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 22,
    fontWeight: "700",
    color: AVATAR_TEXT,
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
  badgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardAction: {
    alignSelf: "stretch",
    marginTop: spacing.sm,
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
  dangerCard: {
    borderColor: `${colors.error}40`,
    backgroundColor: `${colors.error}0D`,
  },
  subsectionTitle: {
    fontSize: 15,
  },
  savedFeedback: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    marginTop: spacing.xs,
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
  connectedBadgeActive: {
    backgroundColor: `${colors.primary}1A`,
    borderColor: colors.primary,
  },
  connectedBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  connectedBadgeTextActive: {
    color: colors.primary,
    fontWeight: "700",
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
