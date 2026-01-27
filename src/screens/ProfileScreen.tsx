/**
 * Profile Screen
 *
 * Profile management with reading stats, achievements, and subscription gating preview.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Modal,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  ScrollView,
  Share as NativeShare,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  BookOpen,
  Flame,
  Mail,
  Settings,
  Shield,
  Share2,
  Sparkles,
  Target,
  UploadCloud,
  Download,
  User,
  Info,
} from "lucide-react-native";
import { GlassButton } from "../components/GlassButton";
import { SignInWithApple } from "../components/SignInWithApple";
import { ComingSoon } from "../components/ComingSoon";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { HeroHeader } from "../components/HeroHeader";
import { ScaleButton } from "../components/ScaleButton";
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
import { useReadingProgressOptional } from "../context/ReadingProgressContext";
import { triggerHaptic } from "../shared/haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KARMA_TIERS = [
  { label: "Fresh", min: 0 },
  { label: "Warm", min: 50 },
  { label: "Steady", min: 150 },
  { label: "Glowing", min: 300 },
];

const PERSONALIZATION_UNLOCK_KARMA = 150;

const ANIMAL_ICON_MAP = {
  aquarium: require("../../assets/icons/Profile Icons/Animal Icons/icons8-aquarium-100.png"),
  bear: require("../../assets/icons/Profile Icons/Animal Icons/icons8-bear-100.png"),
  bee: require("../../assets/icons/Profile Icons/Animal Icons/icons8-bee-100.png"),
  bird: require("../../assets/icons/Profile Icons/Animal Icons/icons8-bird-100.png"),
  blackcat: require("../../assets/icons/Profile Icons/Animal Icons/icons8-black-cat-100.png"),
  jaguar: require("../../assets/icons/Profile Icons/Animal Icons/icons8-black-jaguar-100.png"),
  bug: require("../../assets/icons/Profile Icons/Animal Icons/icons8-bug-100.png"),
  bull: require("../../assets/icons/Profile Icons/Animal Icons/icons8-bull-100.png"),
  butterfly: require("../../assets/icons/Profile Icons/Animal Icons/icons8-butterfly-100.png"),
  cat: require("../../assets/icons/Profile Icons/Animal Icons/icons8-cat-100.png"),
  chicken: require("../../assets/icons/Profile Icons/Animal Icons/icons8-chicken-100.png"),
  clownfish: require("../../assets/icons/Profile Icons/Animal Icons/icons8-clown-fish-100.png"),
  corgi: require("../../assets/icons/Profile Icons/Animal Icons/icons8-corgi-100.png"),
  cow: require("../../assets/icons/Profile Icons/Animal Icons/icons8-cow-100.png"),
  crab: require("../../assets/icons/Profile Icons/Animal Icons/icons8-crab-100.png"),
  dog: require("../../assets/icons/Profile Icons/Animal Icons/icons8-dog-100.png"),
  dogbone: require("../../assets/icons/Profile Icons/Animal Icons/icons8-dog-bone-100.png"),
  doghouse: require("../../assets/icons/Profile Icons/Animal Icons/icons8-dog-house-100.png"),
  dolphin: require("../../assets/icons/Profile Icons/Animal Icons/icons8-dolphin-100.png"),
  dove: require("../../assets/icons/Profile Icons/Animal Icons/icons8-dove-100.png"),
  duck: require("../../assets/icons/Profile Icons/Animal Icons/icons8-duck-100.png"),
  elephant: require("../../assets/icons/Profile Icons/Animal Icons/icons8-elephant-100.png"),
  falcon: require("../../assets/icons/Profile Icons/Animal Icons/icons8-falcon-100.png"),
  fish: require("../../assets/icons/Profile Icons/Animal Icons/icons8-fish-100.png"),
  flamingo: require("../../assets/icons/Profile Icons/Animal Icons/icons8-flamingo-100.png"),
  fox: require("../../assets/icons/Profile Icons/Animal Icons/icons8-fox-100.png"),
  frog: require("../../assets/icons/Profile Icons/Animal Icons/icons8-frog-100.png"),
  germanshepherd: require("../../assets/icons/Profile Icons/Animal Icons/icons8-german-shepherd-100.png"),
  gorilla: require("../../assets/icons/Profile Icons/Animal Icons/icons8-gorilla-100.png"),
  horse: require("../../assets/icons/Profile Icons/Animal Icons/icons8-horse-100.png"),
  kangaroo: require("../../assets/icons/Profile Icons/Animal Icons/icons8-kangaroo-100.png"),
  ladybug: require("../../assets/icons/Profile Icons/Animal Icons/icons8-ladybug-100.png"),
  lion: require("../../assets/icons/Profile Icons/Animal Icons/icons8-lion-100.png"),
  mouse: require("../../assets/icons/Profile Icons/Animal Icons/icons8-mouse-animal-100.png"),
  octopus: require("../../assets/icons/Profile Icons/Animal Icons/icons8-octopus-100.png"),
  owl: require("../../assets/icons/Profile Icons/Animal Icons/icons8-owl-100.png"),
  panda: require("../../assets/icons/Profile Icons/Animal Icons/icons8-panda-100.png"),
  parrot: require("../../assets/icons/Profile Icons/Animal Icons/icons8-parrot-100.png"),
  pelican: require("../../assets/icons/Profile Icons/Animal Icons/icons8-pelican-100.png"),
  penguin: require("../../assets/icons/Profile Icons/Animal Icons/icons8-penguin-100.png"),
  pig: require("../../assets/icons/Profile Icons/Animal Icons/icons8-pig-100.png"),
  prawn: require("../../assets/icons/Profile Icons/Animal Icons/icons8-prawn-100.png"),
  rabbit: require("../../assets/icons/Profile Icons/Animal Icons/icons8-rabbit-100.png"),
  runningrabbit: require("../../assets/icons/Profile Icons/Animal Icons/icons8-running-rabbit-100.png"),
  shark: require("../../assets/icons/Profile Icons/Animal Icons/icons8-shark-100.png"),
  sheep: require("../../assets/icons/Profile Icons/Animal Icons/icons8-sheep-100.png"),
  snail: require("../../assets/icons/Profile Icons/Animal Icons/icons8-snail-100.png"),
  spider: require("../../assets/icons/Profile Icons/Animal Icons/icons8-spider-100.png"),
  starfish: require("../../assets/icons/Profile Icons/Animal Icons/icons8-starfish-100.png"),
  turtle: require("../../assets/icons/Profile Icons/Animal Icons/icons8-turtle-100.png"),
  unicorn: require("../../assets/icons/Profile Icons/Animal Icons/icons8-unicorn-100.png"),
  whale: require("../../assets/icons/Profile Icons/Animal Icons/icons8-whale-100.png"),
  wolf: require("../../assets/icons/Profile Icons/Animal Icons/icons8-wolf-100.png"),
} as const;
const ANIMAL_ICON_KEYS = Object.keys(ANIMAL_ICON_MAP) as Array<keyof typeof ANIMAL_ICON_MAP>;

const sanitizeAnimalKey = (value?: string) => value?.toLowerCase().replace(/[^a-z]/g, "") ?? null;

const extractAnimalKey = (codename?: string) => {
  if (!codename) return null;
  const parts = codename.trim().split(" ");
  const last = parts[parts.length - 1];
  return sanitizeAnimalKey(last);
};

const getAnimalIconSource = (codename?: string) => {
  const key = extractAnimalKey(codename);
  if (key) {
    const directMatch = (ANIMAL_ICON_MAP as Record<string, unknown>)[key];
    if (directMatch) return directMatch;
  }

  // Always return a deterministic fallback icon so the avatar never disappears
  const seed = (key || codename || "reader").toLowerCase();
  const hash = seed.split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 9973, 7);
  const fallbackKey = ANIMAL_ICON_KEYS[hash % ANIMAL_ICON_KEYS.length];
  return ANIMAL_ICON_MAP[fallbackKey];
};

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

const PROFILE_ONBOARDING_KEY = "profileOnboardingVersion";
const PROFILE_ONBOARDING_PREVIEWS = [
  "Gliding Otter",
  "Curious Falcon",
  "Steady Fox",
  "Calm Panda",
  "Bright Heron",
  "Quiet Lynx",
];

const ProfileScreen: React.FC = () => {
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
  const {
    subscriptionFeaturesLocked,
    reduceMotion,
    hapticIntensity,
    devProfileSyncCardEnabled,
    devDataControlsEnabled,
  } = useSettings();
  const { readingStats, refreshStats } = useReadingProgressOptional();

  const [settingsTagInput, setSettingsTagInput] = useState(activeProfile?.settingsTag || "");
  const [importCode, setImportCode] = useState("");

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetFeature, setSheetFeature] = useState<string | null>(null);
  const [sheetLocked, setSheetLocked] = useState(true);
  const [sheetAccessStatus, setSheetAccessStatus] = useState<
    "locked" | "karma-unlocked" | "preview"
  >("locked");
  const profileReady = Boolean(activeProfile);
  const [showProfileOnboarding, setShowProfileOnboarding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [refreshStats]),
  );

  const sheetAnim = useRef(new Animated.Value(0)).current; // 0 hidden, 1 shown
  const featureProgressAnim = useRef(new Animated.Value(0)).current;

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
  const achievementsDisplay = profileReady ? achievementCopy : "—/—";
  const karma = derivedArticlesRead * 10 + savedActions * 5 + savedCount * 2;
  const nextTier = KARMA_TIERS.find((tier) => tier.min > karma);
  const karmaProgress = nextTier ? Math.min(1, (karma - (nextTier.min - 50)) / 50) : 1;
  const karmaUnlockProgress = Math.min(1, karma / PERSONALIZATION_UNLOCK_KARMA);
  const hasKarmaUnlock = karma >= PERSONALIZATION_UNLOCK_KARMA;
  const personalizationLocked = subscriptionFeaturesLocked && !hasKarmaUnlock;
  const currentTier = getCurrentKarmaTier(karma);

  const animalIconSource = useMemo(
    () => getAnimalIconSource(activeProfile?.codename),
    [activeProfile?.codename],
  );

  const featureBadgeText = personalizationLocked
    ? "Locked"
    : hasKarmaUnlock
      ? "Karma unlocked"
      : "Preview";
  const featureLockCopy = personalizationLocked
    ? `Earn ${PERSONALIZATION_UNLOCK_KARMA} karma to unlock now. Purchases will arrive later.`
    : hasKarmaUnlock
      ? "Unlocked with karma. Purchases will arrive later."
      : "Temporarily unlocked for testing.";
  const featureStatusLabel = personalizationLocked
    ? "Locked"
    : hasKarmaUnlock
      ? "Unlocked with karma"
      : "Unlocked for testing";
  const sheetTitleCopy =
    sheetAccessStatus === "locked"
      ? "Unlock with karma"
      : sheetAccessStatus === "karma-unlocked"
        ? "Unlocked with karma"
        : "Debug: unlocked";
  const sheetSubtitleCopy =
    sheetAccessStatus === "locked"
      ? `Earn ${PERSONALIZATION_UNLOCK_KARMA} karma to unlock personalization and advanced features today. Purchases will be available later.`
      : sheetAccessStatus === "karma-unlocked"
        ? "You unlocked personalization with your reading karma. Purchases will be available later."
        : "Currently unlocked for debugging. Toggle gating in Debug → Force subscription gating to simulate the paywall.";

  const appleSignedIn = Boolean(activeProfile?.appleUserId);
  const appleStatusLine = appleSignedIn
    ? activeProfile?.email || activeProfile?.name || "Signed in with Apple"
    : "Not signed in";
  const appleBadgeText = appleSignedIn ? "Signed in" : "Signed out";

  const lastReadDisplay = profileReady ? formatRelativeDate(activeProfile?.stats?.lastReadAt) : "—";
  const lastSavedDisplay = profileReady
    ? formatRelativeDate(activeProfile?.stats?.lastSavedAt)
    : "—";
  const karmaTierLabel = profileReady ? `${currentTier.label} tier` : "—";

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

  const openSubscriptionSheet = (feature: string) => {
    const status = personalizationLocked ? "locked" : hasKarmaUnlock ? "karma-unlocked" : "preview";
    setSheetVisible(true);
    setSheetFeature(feature);
    setSheetLocked(status === "locked");
    setSheetAccessStatus(status);
    animateSheet(true);
  };

  const closeSubscriptionSheet = () => {
    animateSheet(false);
    setSheetVisible(false);
    setSheetAccessStatus("locked");
  };

  useEffect(() => {
    setSettingsTagInput(activeProfile?.settingsTag || "");
  }, [activeProfile?.settingsTag]);

  useEffect(() => {
    const parent = navigation.getParent?.();
    if (!parent) return;
    parent.setOptions({ tabBarStyle: sheetVisible ? { display: "none" } : undefined });
  }, [navigation, sheetVisible]);

  useEffect(() => {
    let cancelled = false;
    const loadOnboardingState = async () => {
      try {
        const seenVersion = await AsyncStorage.getItem(PROFILE_ONBOARDING_KEY);
        if (!cancelled && seenVersion !== APP_VERSION) {
          setShowProfileOnboarding(true);
        }
      } catch (error) {
        console.error("Failed to read profile onboarding state", error);
      }
    };
    loadOnboardingState();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      featureProgressAnim.setValue(karmaUnlockProgress);
      return;
    }
    Animated.timing(featureProgressAnim, {
      toValue: karmaUnlockProgress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [featureProgressAnim, karmaUnlockProgress, reduceMotion]);

  const handleSettings = () => navigation.navigate("Settings" as never);

  const handleProfileOnboardingDismiss = useCallback(async () => {
    try {
      await AsyncStorage.setItem(PROFILE_ONBOARDING_KEY, APP_VERSION);
    } catch (error) {
      console.error("Failed to persist profile onboarding state", error);
    } finally {
      setShowProfileOnboarding(false);
    }
  }, []);

  const handleShare = async () => {
    try {
      await NativeShare.share({
        message: `Try ${APP_NAME} — calm, Pittsburgh-focused news with RSVP reading. (${APP_VERSION} build ${APP_BUILD})`,
        url: "https://abridgd.app",
      });
      triggerHaptic("success", hapticIntensity, reduceMotion);
    } catch {
      triggerHaptic("warning", hapticIntensity, reduceMotion);
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
        triggerHaptic("success", hapticIntensity, reduceMotion);
      } else {
        Alert.alert("No mail app", "No mail client is available on this device.");
      }
    } catch {
      triggerHaptic("warning", hapticIntensity, reduceMotion);
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
    triggerHaptic("success", hapticIntensity, reduceMotion);
  };

  const handleImportProfile = () => {
    const cleaned = importCode.trim();
    if (!cleaned) return;
    const success = importProfileKey(cleaned);
    if (success) {
      Alert.alert("Imported", "Profile imported and activated.");
      setImportCode("");
      triggerHaptic("success", hapticIntensity, reduceMotion);
    } else {
      triggerHaptic("warning", hapticIntensity, reduceMotion);
      Alert.alert("Import failed", "Please check the code and try again.");
    }
  };

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [360, 0],
    extrapolate: "clamp",
  });

  const featureProgressWidth = featureProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
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
              {animalIconSource ? (
                <Image
                  source={animalIconSource}
                  style={styles.avatarImage}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <User size={46} color={colors.textSecondary} strokeWidth={1.5} />
              )}
            </View>
            <View style={styles.profileTextBlock}>
              <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">
                {activeProfile?.name || "Anonymous Reader"}
              </Text>
              <View style={styles.codenameRow}>
                <Sparkles size={14} color={colors.textSecondary} />
                <Text
                  style={[styles.profileSubtext, styles.codenameText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Codename: {activeProfile?.codename || "Generating…"}
                </Text>
              </View>
              <View style={styles.codenameRow}>
                <Mail size={14} color={colors.textSecondary} />
                <Text
                  style={[styles.profileSubtext, styles.codenameText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {activeProfile?.email || "Signed out"} · Sync coming soon
                </Text>
              </View>
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
                    {profileReady ? `${karma} karma` : "…"}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{achievementsDisplay} achievements</Text>
                </View>
                <View style={[styles.badge, styles.karmaTierBadge]} accessibilityRole="text">
                  <Text style={styles.badgeText}>{karmaTierLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.profilePillsGrid}>
            <ProfilePill
              label="Reads tracked"
              value={articlesReadDisplay}
              accessibilityLabel={`Reads completed ${articlesReadDisplay}`}
              style={styles.profilePillHalf}
            />
            <ProfilePill
              label="In progress"
              value={inProgressDisplay}
              accessibilityLabel={`Articles in progress ${inProgressDisplay}`}
              style={styles.profilePillHalf}
            />
            <ProfilePill
              label="Saved"
              value={savedCountDisplay}
              accessibilityLabel={`Saved articles ${savedCountDisplay}`}
              style={styles.profilePillHalf}
            />
            <ProfilePill
              label="Avg completion"
              value={completionDisplay}
              accessibilityLabel={`Average completion ${completionDisplay}`}
              style={styles.profilePillHalf}
            />
          </View>

          {!profileReady ? (
            <ProfileLoadingBar />
          ) : (
            <Text style={styles.noteText}>
              Reading stats come from tracked sessions and stay on this device until sync launches.
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
              label="Tracked reads"
              value={articlesReadDisplay}
              hint="Completed articles from the reading tracker"
            />
            <StatRow
              label="In-progress articles"
              value={inProgressDisplay}
              hint="Currently being read"
            />
            <StatRow label="Reading time" value={readTimeDisplay} hint="Time spent in articles" />
            <StatRow
              label="Average completion"
              value={completionDisplay}
              hint="Across all tracked reads"
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
            <StatRow label="Last read" value={lastReadDisplay} hint="Relative to today" />
            <StatRow
              label="Last saved"
              value={lastSavedDisplay}
              hint="Most recent save or sync write"
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
          Capability layer for readers who want extra control. Earn enough karma to unlock it now;
          purchases will come later.
        </Text>
        <View style={styles.featurePanel}>
          <View
            style={styles.featureStatusChip}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${featureStatusLabel}. ${featureLockCopy}`}
          >
            <Sparkles size={16} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.featureStatusText}>{featureStatusLabel}</Text>
              <Text style={styles.featureStatusHint}>{featureLockCopy}</Text>
            </View>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>{featureBadgeText}</Text>
            </View>
          </View>

          <View
            style={styles.featureProgress}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Karma toward personalization unlock"
            accessibilityValue={{
              min: 0,
              max: PERSONALIZATION_UNLOCK_KARMA,
              now: karma,
              text: `${karma}/${PERSONALIZATION_UNLOCK_KARMA} karma`,
            }}
          >
            <View
              style={[styles.featureProgressFill, { width: `${karmaUnlockProgress * 100}%` }]}
            />
          </View>
          <View style={styles.featureProgressMeta}>
            <Text style={styles.featureProgressText}>
              {karma}/{PERSONALIZATION_UNLOCK_KARMA} karma
            </Text>
            <Text style={styles.featureProgressHint}>
              {hasKarmaUnlock ? "Unlocked with karma" : `Keep reading to unlock personalization`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.featureTile, styles.featureTileButton]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Focus and grounding modes. ${featureStatusLabel}. ${featureLockCopy}`}
            accessibilityHint="Opens subscription sheet for focus & grounding"
            onPress={() => openSubscriptionSheet("Focus & grounding modes")}
            activeOpacity={0.85}
          >
            <View style={styles.featureTileHeader}>
              <Flame size={18} color={colors.textSecondary} />
              <View style={styles.featureTileText}>
                <Text style={styles.featureTitle}>Focus & grounding modes</Text>
                <Text style={styles.featureDesc}>
                  Quiet delivery, pacing, and mode presets. {featureLockCopy}
                </Text>
              </View>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>{featureBadgeText}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

        <View style={styles.section}>
          <SectionHeader title="Sync & privacy" />
          {devProfileSyncCardEnabled ? (
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
                  <Text style={styles.connectedDesc}>{appleStatusLine}</Text>
                </View>
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedBadgeText}>{appleBadgeText}</Text>
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
          ) : (
            <ComingSoon
              variant="inline"
              title="Sync & profile export"
              description="Dev toggle only. Enable in Debug → Profile dev toggles."
              icon="lock"
            />
          )}

          {devProfileSyncCardEnabled ? (
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
          ) : null}

          <View style={[styles.card, { marginTop: spacing.md }]}>
            <SectionHeader title="Data controls" compact />
            {devDataControlsEnabled ? (
              <>
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
                  onPress={() =>
                    Alert.alert("Coming soon", "Local data deletion will ship with sync.")
                  }
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
              </>
            ) : (
              <>
                <Text style={styles.sectionDesc}>
                  Data stays on this device. A device-only wipe will ship with sync along with
                  consent controls.
                </Text>
                <ComingSoon
                  variant="inline"
                  title="Device-only wipe"
                  description="Arriving with sync. Keeps data local until you opt in."
                  icon="clock"
                  style={{ marginTop: spacing.sm }}
                />
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick actions" />
          <View style={styles.actionsRow}>
            <ActionButton
              label="Share app"
              Icon={Share2}
              onPress={handleShare}
              accessibilityLabel="Share app"
              accessibilityHint="Opens the native share sheet with a link to Abridgd."
              prominence="tinted"
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
              label="Settings"
              Icon={Settings}
              onPress={handleSettings}
              accessibilityLabel="Open settings"
              accessibilityHint="Opens app settings including reading and customization options."
              prominence="filled"
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
            <Text style={styles.sheetTitle}>{sheetTitleCopy}</Text>
            <Text style={styles.sheetSubtitle}>
              {sheetFeature || "This control"} — {sheetSubtitleCopy}
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
      <ProfileOnboardingModal
        visible={showProfileOnboarding}
        codename={activeProfile?.codename}
        reduceMotion={reduceMotion}
        onClose={handleProfileOnboardingDismiss}
      />
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
}) => (
  <Text style={[styles.sectionTitle, compact && { marginBottom: spacing.sm }, style]}>{title}</Text>
);

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
}) => (
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
}) => (
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

const ProfileLoadingBar: React.FC = () => {
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const sequence = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0.2,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    sequence.start();
    return () => sequence.stop();
  }, [progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["10%", "94%"],
  });

  return (
    <View style={styles.profileLoadingContainer}>
      <Text style={styles.profileLoadingLabel}>Tuning your profile...</Text>
      <View style={styles.profileLoadingTrack}>
        <Animated.View style={[styles.profileLoadingFill, { width }]} />
      </View>
    </View>
  );
};

const ProfileOnboardingModal: React.FC<{
  visible: boolean;
  codename?: string;
  reduceMotion: boolean;
  onClose: () => void;
}> = ({ visible, codename, reduceMotion, onClose }) => {
  const [displayName, setDisplayName] = React.useState("Generating your codename…");
  const scaleAnim = React.useRef(new Animated.Value(0.98)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!visible) return;
    let active = true;
    const pool = [...PROFILE_ONBOARDING_PREVIEWS];
    const finalName = codename || "Reader";
    if (!pool.includes(finalName)) pool.push(finalName);

    setDisplayName("Generating your codename…");

    if (reduceMotion) {
      const t = setTimeout(() => active && setDisplayName(finalName), 400);
      timersRef.current.push(t);
      return;
    }

    // Sequential shuffle: race through the list a few times, then ease to the final name.
    const passes = 3;
    const steps = pool.length * passes;
    const baseDelay = 55;
    const ramp = 18; // slows down over time
    for (let i = 0; i < steps; i++) {
      const delay = baseDelay + i * ramp;
      const name = pool[i % pool.length];
      const timer = setTimeout(() => {
        if (active) setDisplayName(name);
      }, delay);
      timersRef.current.push(timer);
    }

    const finalDelay = baseDelay + steps * ramp + 260;
    const finalTimer = setTimeout(() => {
      if (active) setDisplayName(finalName);
    }, finalDelay);
    timersRef.current.push(finalTimer);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.04,
          duration: reduceMotion ? 0 : 420,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: reduceMotion ? 0 : 420,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    if (!reduceMotion) {
      pulse.start();
    } else {
      scaleAnim.setValue(1);
    }

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 340,
      useNativeDriver: true,
    }).start();

    return () => {
      active = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      pulse.stop();
    };
  }, [visible, codename, reduceMotion, scaleAnim, fadeAnim]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.onboardingOverlay}>
        <TouchableOpacity
          style={styles.onboardingBackdrop}
          activeOpacity={0.9}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss profile welcome"
        />
        <View style={styles.onboardingCardWrapper} pointerEvents="box-none">
          <View style={styles.onboardingCard} accessibilityViewIsModal>
            <TouchableOpacity
              style={styles.onboardingDismissButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Skip profile welcome"
            >
              <Text style={styles.onboardingDismissText}>Skip</Text>
            </TouchableOpacity>
            <View style={styles.onboardingHeader}>
              <Sparkles size={22} color={colors.primary} strokeWidth={1.2} />
              <Text style={styles.onboardingTitle}>Profile primer</Text>
            </View>
            <Animated.Text
              style={[
                styles.onboardingName,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {displayName}
            </Animated.Text>
            <Text style={styles.onboardingDescription}>
              Every profile ships with a locally stored codename, stats, and achievements. This card
              is just for you and only shows once per release, so you can revisit stats with ease.
            </Text>
            <Text style={styles.onboardingWheelHint}>
              Spinning codenames while the profile warms up — tap Skip or the backdrop to dismiss.
            </Text>
            <ScaleButton style={styles.onboardingButton} onPress={onClose}>
              <Text style={styles.onboardingButtonText}>Got it</Text>
            </ScaleButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  profileLoadingContainer: {
    marginTop: spacing.sm,
  },
  profileLoadingLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profileLoadingTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  profileLoadingFill: {
    height: "100%",
    backgroundColor: colors.tint,
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
  avatarImage: {
    width: 64,
    height: 64,
    tintColor: colors.text,
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
    flexShrink: 1,
  },
  codenameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  codenameText: {
    flex: 1,
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
  karmaTierBadge: {
    backgroundColor: colors.background,
    borderColor: colors.border,
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
  featurePanel: {
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondaryBackground,
    gap: spacing.md,
  },
  featureTile: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  featureTileButton: {
    borderStyle: "solid",
  },
  featureTileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureTileText: {
    flex: 1,
    gap: 2,
  },
  featureTileBody: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  featureProgress: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: "hidden",
    marginTop: spacing.sm,
  },
  featureProgressFill: {
    height: "100%",
    backgroundColor: `${colors.tint}70`,
  },
  featureProgressMeta: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featureProgressText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  featureProgressHint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    textAlign: "right",
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
  featureStatusChip: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondaryBackground,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  featureStatusText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  featureStatusHint: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  onboardingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 6, 6, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.gutter,
  },
  onboardingBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  onboardingCardWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  onboardingCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  onboardingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  onboardingDismissButton: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  onboardingDismissText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  onboardingTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    fontWeight: "700",
    color: colors.text,
  },
  onboardingName: {
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.size.lg * 1.6,
    color: colors.text,
    textAlign: "center",
  },
  onboardingDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  onboardingWheelHint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: -spacing.xs,
  },
  onboardingButton: {
    marginTop: spacing.sm,
    width: "100%",
    alignSelf: "stretch",
  },
  onboardingButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.md,
    fontWeight: "600",
    color: colors.background,
  },
});

export default ProfileScreen;
