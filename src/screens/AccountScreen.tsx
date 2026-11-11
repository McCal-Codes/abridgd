/**
 * Account and backup
 *
 * Sign in, profile label, backup and transfer, support, and the delete-data control. Kept off the
 * Profile tab so that tab stays a short, calm summary; reached from the "Account and backup" row.
 */

import React, { useEffect, useRef, useState } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
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
import {
  APP_BUILD,
  APP_NAME,
  APP_VERSION,
  BUG_EMAIL_BODY_TEMPLATE,
  BUG_EMAIL_SUBJECT,
  CONTACT_EMAIL,
} from "../config/appInfo";
import { useProfiles } from "../context/ProfileContext";
import { useThemedStyles } from "../theme/useThemedStyles";

const AccountScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  const bottomPadding = insets.bottom + spacing.xl;

  const {
    activeProfile,
    signInWithAppleProfile,
    signOut,
    deleteActiveProfile,
    exportProfileKey,
    importProfileKey,
    updateSettingsTag,
  } = useProfiles();

  const [settingsTagInput, setSettingsTagInput] = useState(activeProfile?.settingsTag || "");
  const [importCode, setImportCode] = useState("");
  const [tagSaved, setTagSaved] = useState(false);
  const tagSavedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tagSavedTimeout.current) clearTimeout(tagSavedTimeout.current);
    };
  }, []);

  useEffect(() => {
    setSettingsTagInput(activeProfile?.settingsTag || "");
  }, [activeProfile?.settingsTag]);

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

    setTagSaved(true);
    if (tagSavedTimeout.current) clearTimeout(tagSavedTimeout.current);
    tagSavedTimeout.current = setTimeout(() => setTagSaved(false), 1800);
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

  const handleDeleteLocalData = () => {
    Alert.alert(
      "Delete local data",
      "This removes this profile along with its saved articles and reading progress from this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const profile = await deleteActiveProfile();
              Alert.alert("Deleted", `Local data removed. Switched to ${profile.name}.`);
            } catch (e) {
              console.error("Failed to delete local data:", e);
              Alert.alert("Error", "Couldn't delete local data. Please try again.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.body, { paddingTop: spacing.md }]}>
        <View style={styles.section}>
          <SectionHeader title="Account & backup" />

          <View style={[styles.card, styles.transferCard]}>
            <SectionHeader title="Sign in" compact style={styles.subsectionTitle} />
            <View style={styles.connectedRow}>
              <View style={styles.connectedIcon}>
                <Shield size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.connectedTextBlock}>
                <Text style={styles.connectedTitle}>Apple Account</Text>
                <Text style={styles.connectedDesc}>
                  {activeProfile?.appleUserId
                    ? "Signed in. Your codename and stats stay tied to this Apple ID."
                    : "Sign in to keep your codename and stats recoverable if you switch devices."}
                </Text>
              </View>
              <View
                style={[
                  styles.connectedBadge,
                  activeProfile?.appleUserId && styles.connectedBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.connectedBadgeText,
                    activeProfile?.appleUserId && styles.connectedBadgeTextActive,
                  ]}
                >
                  {activeProfile?.appleUserId ? "Connected" : "Local only"}
                </Text>
              </View>
            </View>

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
            ) : (
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
            )}
          </View>

          <View style={[styles.card, styles.transferCard]}>
            <SectionHeader title="Backup & transfer" compact style={styles.subsectionTitle} />
            <Text style={styles.sectionDesc}>
              Label this device, keep a backup code handy, and import a profile when you need to
              move settings later.
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
            {tagSaved ? (
              <Text style={styles.savedFeedback} accessibilityLiveRegion="polite">
                Saved
              </Text>
            ) : null}

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
            <Text style={styles.transferHint}>Keep this code private.</Text>
          </View>

          <View style={[styles.card, styles.dangerCard]}>
            <SectionHeader title="Danger zone" compact style={styles.subsectionTitle} />
            <GlassButton
              label="Delete local data"
              prominence="standard"
              destructive
              onPress={handleDeleteLocalData}
              accessibilityLabel="Delete local data"
              accessibilityHint="Removes this profile's saved articles and reading progress from this device."
            />
            <Text style={styles.transferHint}>
              Removes this profile's saved articles and reading progress from this device. App
              settings stay as they are. This cannot be undone.
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

export default AccountScreen;
