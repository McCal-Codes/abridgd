/**
 * Profile Screen
 *
 * Profile management with reading stats, achievements, and subscription gating preview.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  ScrollView,
  Share as NativeShare,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  BookOpen,
  Flame,
  Mail,
  Shield,
  Sparkles,
  Target,
  UploadCloud,
  Download,
  User,
} from "lucide-react-native";
import { GlassButton } from "../components/GlassButton";
import { SignInWithApple } from "../components/SignInWithApple";
import { ComingSoon } from "../components/ComingSoon";
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
import { useSettings } from "../context/SettingsContext";
import { useThemedStyles } from "../theme/useThemedStyles";

const KARMA_TIERS = [
  { label: "Fresh", min: 0 },
  { label: "Warm", min: 50 },
  { label: "Steady", min: 150 },
  { label: "Glowing", min: 300 },
];

const ProfileScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {
    activeProfile,
    signInWithAppleProfile,
    signOut,
    exportProfileKey,
    importProfileKey,
    updateSettingsTag,
  } = useProfiles();
  const { subscriptionFeaturesLocked, reduceMotion } = useSettings();

  const [settingsTagInput, setSettingsTagInput] = useState(activeProfile?.settingsTag || "");
  const [importCode, setImportCode] = useState("");

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetFeature, setSheetFeature] = useState<string | null>(null);
  const [sheetLocked, setSheetLocked] = useState(true);
  const profileReady = Boolean(activeProfile);

  const sheetAnim = useRef(new Animated.Value(0)).current; // 0 hidden, 1 shown

  const achievementStatuses = useMemo(
    () => getAchievementStatuses(activeProfile || undefined),
    [activeProfile],
  );
  const achievementsUnlocked = achievementStatuses.filter((a) => a.earned).length;
  const achievementCopy = `${achievementsUnlocked}/${achievementStatuses.length}`;

  const articlesRead = activeProfile?.stats?.articlesRead || 0;
  const savedActions = activeProfile?.stats?.savedActions || 0;
  const savedCount = activeProfile?.savedArticles?.length || 0;
  const articlesReadDisplay = profileReady ? `${articlesRead}` : "—";
  const savedCountDisplay = profileReady ? `${savedCount}` : "—";
  const achievementsDisplay = profileReady ? achievementCopy : "—/—";
  const karma = articlesRead * 10 + savedActions * 5 + savedCount * 2;
  const nextTier = KARMA_TIERS.find((tier) => tier.min > karma);
  const karmaProgress = nextTier ? Math.min(1, (karma - (nextTier.min - 50)) / 50) : 1;

  const featureBadgeText = subscriptionFeaturesLocked ? "Locked" : "Preview";
  const featureLockCopy = subscriptionFeaturesLocked
    ? "Locked until subscriptions launch."
    : "Temporarily unlocked for testing.";
  const featureStatusLabel = subscriptionFeaturesLocked ? "Locked" : "Unlocked for testing";

  const sheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => Math.abs(gestureState.dy) > 6,
      onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const next = Math.max(0, gestureState.dy * -1);
        sheetAnim.setValue(Math.min(next, 400));
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dy > 40) {
          closeSubscriptionSheet();
          return;
        }
        animateSheet(true);
      },
    }),
  ).current;

  const animateSheet = (show: boolean) => {
    const toValue = show ? 1 : 0;
    const duration = reduceMotion ? 120 : 260;
    Animated.timing(sheetAnim, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start(() => {
      setSheetVisible(show);
      if (!show) {
        setSheetFeature(null);
      }
    });
  };

  const openSubscriptionSheet = (feature: string, locked: boolean) => {
    setSheetVisible(true);
    setSheetFeature(feature);
    setSheetLocked(locked);
    animateSheet(true);
  };

  const closeSubscriptionSheet = () => {
    animateSheet(false);
    setSheetVisible(false);
  };

  useEffect(() => {
    setSettingsTagInput(activeProfile?.settingsTag || "");
  }, [activeProfile?.settingsTag]);

  useEffect(() => {
    const parent = navigation.getParent?.();
    if (!parent) return;
    parent.setOptions({ tabBarStyle: sheetVisible ? { display: "none" } : undefined });
  }, [navigation, sheetVisible]);

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

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [360, 0],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerContainer, { paddingTop: spacing.md }]}>
          <HeroHeader title="Profile" subtitle="Your calm hub for stats and settings" Icon={User} />
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
              <View style={styles.badgeRow}>
                <View
                  style={[styles.badge, styles.karmaBadge]}
                  accessibilityLabel={`${karma} karma points`}
                  accessibilityRole="text"
                >
                  <Text style={[styles.badgeText, styles.karmaBadgeText]}>
                    {profileReady ? karma : "…"} karma
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{achievementsDisplay} achievements</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.profilePillsRow}>
            <View style={styles.profilePill}>
              <Text style={styles.profilePillLabel}>Reads</Text>
              <Text
                style={styles.profilePillValue}
                accessibilityLabel={`Articles read ${articlesReadDisplay}`}
              >
                {articlesReadDisplay}
              </Text>
            </View>
            <View style={styles.profilePill}>
              <Text style={styles.profilePillLabel}>Saved</Text>
              <Text
                style={styles.profilePillValue}
                accessibilityLabel={`Saved articles ${savedCountDisplay}`}
              >
                {savedCountDisplay}
              </Text>
            </View>
            <View style={styles.profilePill}>
              <Text style={styles.profilePillLabel}>Achievements</Text>
              <Text
                style={styles.profilePillValue}
                accessibilityLabel={`Achievements ${achievementsDisplay}`}
              >
                {achievementsDisplay}
              </Text>
            </View>
          </View>

          {!profileReady ? (
            <Text style={styles.noteText}>Loading your profile…</Text>
          ) : (
            <Text style={styles.noteText}>
              Stats and saved articles stay on this device until sync launches.
            </Text>
          )}

          {activeProfile?.appleUserId ? (
            <GlassButton
              label="Sign out"
              prominence="standard"
              onPress={() => {
                const profile = signOut();
                Alert.alert("Signed out", `Switched to ${profile.name}.`);
              }}
              accessibilityLabel="Sign out of Apple account"
              style={[styles.inlineButton, { marginTop: spacing.md }]}
            />
          ) : null}
        </View>

        <GlassButton
          label="Settings"
          prominence="standard"
          onPress={handleSettings}
          accessibilityLabel="Open settings"
          style={[styles.inlineButton, styles.settingsButton]}
        />

        <View style={styles.section}>
          <SectionHeader title="Activity" />

          <View style={styles.karmaRow}>
            <Text style={styles.karmaLabel}>Reading karma</Text>
            <Text style={styles.karmaValue}>{karma}</Text>
            <Text style={styles.karmaHint}>
              {nextTier
                ? `${nextTier.label} in ${Math.max(0, nextTier.min - karma)} points`
                : "Max tier unlocked"}
            </Text>
            <View
              style={styles.progressBar}
              accessibilityRole="progressbar"
              accessibilityLabel="Karma progress"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.round(Math.max(0, Math.min(1, karmaProgress)) * 100),
                text: `${Math.round(karmaProgress * 100)}% toward next tier`,
              }}
            >
              <View style={[styles.progressFillMuted, { width: `${karmaProgress * 100}%` }]} />
            </View>
          </View>

          <View style={styles.statGroup}>
            <StatRow
              label="Articles read"
              value={articlesReadDisplay}
              hint="All-time reads on this device"
            />
            <StatRow
              label="Saved articles"
              value={savedCountDisplay}
              hint="Stays on this device until sync launches"
            />
            <StatRow
              label="Saves performed"
              value={profileReady ? `${savedActions}` : "—"}
              hint="Times you saved from feed or article"
            />
            <StatRow
              label="Reading streak"
              value="0 days"
              hint="Read today to start your streak"
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Achievements" />
          <Text style={styles.sectionDesc}>
            Achievements track quietly in the background. Open the list when you want a progress
            check.
          </Text>
          <GlassButton
            label={`View achievements (${achievementCopy})`}
            prominence="tinted"
            onPress={() => navigation.navigate("Achievements" as never)}
            accessibilityLabel="View achievements"
            accessibilityHint="Opens the achievements screen"
            style={styles.inlineButton}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Personalization & advanced features" />
          <Text style={styles.sectionDesc}>
            Capability layer for readers who want extra control. These stay off until subscriptions
            launch.
          </Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.featureRow}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Reading pace and presentation. ${featureStatusLabel}. ${featureLockCopy}`}
              accessibilityHint="Opens subscription sheet for pacing controls"
              onPress={() =>
                openSubscriptionSheet("Reading pace & presentation", subscriptionFeaturesLocked)
              }
              activeOpacity={0.75}
            >
              <View style={styles.featureIcon}>
                <Sparkles size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.featureTextBlock}>
                <Text style={styles.featureTitle}>Reading pace & presentation</Text>
                <Text style={styles.featureDesc}>
                  Adjust pacing, typography, and density. {featureLockCopy}
                </Text>
              </View>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>{featureBadgeText}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.featureRow}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Digest tuning. ${featureStatusLabel}. ${featureLockCopy}`}
              accessibilityHint="Opens subscription sheet for digest tuning"
              onPress={() => openSubscriptionSheet("Digest tuning", subscriptionFeaturesLocked)}
              activeOpacity={0.75}
            >
              <View style={styles.featureIcon}>
                <Target size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.featureTextBlock}>
                <Text style={styles.featureTitle}>Digest tuning</Text>
                <Text style={styles.featureDesc}>
                  Control cadence, sections, and signal. {featureLockCopy}
                </Text>
              </View>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>{featureBadgeText}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.featureRow, styles.featureRowLast]}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Focus and grounding modes. ${featureStatusLabel}. ${featureLockCopy}`}
              accessibilityHint="Opens subscription sheet for focus & grounding"
              onPress={() =>
                openSubscriptionSheet("Focus & grounding modes", subscriptionFeaturesLocked)
              }
              activeOpacity={0.75}
            >
              <View style={styles.featureIcon}>
                <Flame size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.featureTextBlock}>
                <Text style={styles.featureTitle}>Focus & grounding modes</Text>
                <Text style={styles.featureDesc}>
                  Quiet delivery, pacing, and mode presets. {featureLockCopy}
                </Text>
              </View>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>{featureBadgeText}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Sync & privacy" />
          <View style={styles.card}>
            <Text style={styles.sectionDesc}>
              Sign in with Apple will sync preferences, history, and saved articles when it
              launches.
            </Text>
            <View style={styles.connectedRow}>
              <View style={styles.connectedIcon}>
                <Shield size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.connectedTextBlock}>
                <Text style={styles.connectedTitle}>Apple Account</Text>
                <Text style={styles.connectedDesc}>Temporarily disabled — coming soon</Text>
              </View>
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedBadgeText}>Offline</Text>
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
            <View style={styles.noticeRow}>
              <Shield size={18} color={colors.textSecondary} />
              <Text style={styles.noticeText}>
                No tracking. Data stays on-device until you opt in.
              </Text>
            </View>
          </View>

          <View style={[styles.card, styles.transferCard]}>
            <SectionHeader title="Profile settings" compact />
            <Text style={styles.sectionDesc}>
              Add a short tag so you recognize this local profile’s preferences.
            </Text>
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

            <SectionHeader title="Backup & transfer" compact style={{ marginTop: spacing.lg }} />
            <Text style={styles.sectionDesc}>
              Use the profile key to move your settings, achievements, and saved items to another
              device.
            </Text>

            <View style={styles.transferRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.transferLabel}>Profile key</Text>
                <Text style={styles.transferCode} selectable>
                  {activeProfile?.transferKey || "Unavailable"}
                </Text>
              </View>
              <GlassButton
                label="Share code"
                prominence="standard"
                onPress={handleExportProfile}
                accessibilityLabel="Share profile code"
                accessibilityHint="Opens the share sheet with your profile code."
                style={styles.transferButton}
                icon={<UploadCloud size={16} color={colors.text} strokeWidth={2} />}
              />
            </View>

            <TextInput
              value={importCode}
              onChangeText={setImportCode}
              placeholder="Paste profile code to import"
              style={[styles.textInput, { marginTop: spacing.sm }]}
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
              style={styles.transferButton}
              icon={<Download size={16} color={colors.text} strokeWidth={2} />}
            />
            <Text style={styles.transferHint}>
              Keep this code private. It includes your settings, achievements, and saved items.
            </Text>
          </View>

          <View style={[styles.card, { marginTop: spacing.md }]}>
            <SectionHeader title="Data controls" compact />
            <Text style={styles.sectionDesc}>
              Manage your data on this device. Full export/delete and consent controls will ship
              with sync.
            </Text>
            <GlassButton
              label="Export profile key"
              prominence="standard"
              onPress={handleExportProfile}
              accessibilityLabel="Export profile key"
              accessibilityHint="Generates and shares your profile key for backup."
              style={styles.inlineButton}
              icon={<UploadCloud size={16} color={colors.text} strokeWidth={2} />}
            />
            <GlassButton
              label="Delete local data"
              prominence="standard"
              onPress={() => Alert.alert("Coming soon", "Local data deletion will ship with sync.")}
              accessibilityLabel="Delete local data"
              accessibilityHint="Future control to remove local profile data."
              style={[styles.inlineButton, styles.destructiveSpacing]}
            />
            <ComingSoon
              variant="inline"
              title="Data consent"
              description="Granular consent and deletion controls arrive with sync."
              icon="clock"
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick actions" />
          <View style={styles.actionsRow}>
            <ActionButton
              label="Settings"
              Icon={Mail}
              onPress={handleSettings}
              accessibilityLabel="Open settings"
              accessibilityHint="Opens app settings including reading and customization options."
              prominence="filled"
            />
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
      {sheetVisible && (
        <View style={styles.sheetOverlay} accessibilityViewIsModal importantForAccessibility="yes">
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={closeSubscriptionSheet}
            accessibilityRole="button"
            accessibilityLabel="Dismiss subscription sheet"
            accessibilityHint="Closes the subscription notice and returns to profile"
          />
          <Animated.View
            accessible
            accessibilityLabel="Subscription options"
            style={[
              styles.sheetContainer,
              {
                transform: [{ translateY: sheetTranslate }],
                paddingBottom: spacing.xl + Math.max(insets.bottom, spacing.md),
              },
            ]}
            {...sheetPanResponder.panHandlers}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {sheetLocked ? "Subscription required" : "Debug: unlocked"}
            </Text>
            <Text style={styles.sheetSubtitle}>
              {sheetFeature || "This control"} is{" "}
              {sheetLocked
                ? "part of our upcoming subscription."
                : "currently unlocked for debugging."}{" "}
              Toggle gating in Debug → Force subscription gating to simulate the paywall.
            </Text>
            <GlassButton
              label="Maybe later"
              prominence="standard"
              onPress={closeSubscriptionSheet}
              accessibilityLabel="Dismiss subscription sheet"
              style={styles.sheetButton}
            />
            <GlassButton
              label={sheetLocked ? "See plans" : "Close"}
              prominence={sheetLocked ? "tinted" : "standard"}
              onPress={() => {
                closeSubscriptionSheet();
                if (sheetLocked) {
                  Alert.alert("Coming soon", "Plans and pricing will appear here soon.");
                }
              }}
              accessibilityLabel={sheetLocked ? "See subscription plans" : "Close sheet"}
              style={styles.sheetButton}
            />
          </Animated.View>
        </View>
      )}
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
        <Text style={styles.statRowLabel}>{label}</Text>
        {hint ? <Text style={styles.statRowHint}>{hint}</Text> : null}
      </View>
      <Text style={styles.statRowValue}>{value}</Text>
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
  profilePillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  profilePill: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profilePillLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  profilePillValue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  });

export default ProfileScreen;
