/**
 * OnboardingScreen v2 - the redone first-run flow.
 *
 * Changelog (per docs/standards/onboarding-whats-new.md, which asks for a copy file rather than
 * an in-place edit):
 * - Six steps instead of six slides, each a real surface: the finite brief, working newsroom
 *   toggles, a tap-to-try reader, the heavy-stories choice (mapped onto the existing content-note
 *   settings), Events and Resources, and the trust pledge.
 * - Skip is always on screen and never discards a choice already made; every choice writes
 *   through immediately, so there is nothing to lose by leaving.
 * - A Back button on every step but the first.
 * - Start ids from other screens resolve through `resolveStartStep`, which also accepts the ids
 *   the old flow used. App Info used to send "practice", which matched nothing.
 * - The grounding-style carousel of the old flow now appears only when "Add a breathing pause"
 *   is chosen.
 * - The What's New surface is unchanged and still lives behind `mode: "whatsNew"`.
 *
 * `OnboardingScreen.tsx` (the previous flow) is left in place for comparison and is no longer
 * routed to.
 */
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChevronLeft } from "lucide-react-native";
import { RootStackParamList } from "../navigation/types";
import { useSettings } from "../context/SettingsContext";
import { AroundStep } from "../features/onboarding/AroundStep";
import { HeavyStoriesStep } from "../features/onboarding/HeavyStoriesStep";
import { NewsroomsStep } from "../features/onboarding/NewsroomsStep";
import { ReaderStep } from "../features/onboarding/ReaderStep";
import { ReadyStep } from "../features/onboarding/ReadyStep";
import { resolveStartStep, STEP_IDS } from "../features/onboarding/steps";
import { WelcomeStep } from "../features/onboarding/WelcomeStep";
import { spacing } from "../theme/spacing";
import { fontScaleLimit, typography } from "../theme/typography";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { WhatsNewView } from "./onboarding/WhatsNewView";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STEP_COMPONENTS: Record<(typeof STEP_IDS)[number], React.FC> = {
  welcome: WelcomeStep,
  newsrooms: NewsroomsStep,
  reader: ReaderStep,
  "heavy-stories": HeavyStoriesStep,
  around: AroundStep,
  ready: ReadyStep,
};

export const OnboardingScreenV2: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, markVersionSeen } = useSettings();

  const mode = (route?.params?.mode as "firstRun" | "whatsNew" | undefined) ?? "firstRun";
  const [index, setIndex] = useState(() => resolveStartStep(route?.params?.startSlideId));
  const scrollRef = React.useRef<ScrollView>(null);

  const isLast = index === STEP_IDS.length - 1;

  const goTo = useCallback((next: number) => {
    setIndex(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const finish = useCallback(
    async (options?: { openSettings?: boolean }) => {
      await completeOnboarding();
      if (options?.openSettings) {
        navigation.reset({ index: 1, routes: [{ name: "Main" }, { name: "Settings" }] });
        return;
      }
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    },
    [completeOnboarding, navigation],
  );

  if (mode === "whatsNew") {
    return (
      <WhatsNewView
        onDismiss={() => {
          void markVersionSeen();
          navigation.reset({ index: 0, routes: [{ name: "Main" }] });
        }}
      />
    );
  }

  const Step = STEP_COMPONENTS[STEP_IDS[index]];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        {index > 0 ? (
          <Pressable
            testID="onboarding-back"
            onPress={() => goTo(index - 1)}
            style={styles.topButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={22} color={colors.tintStrong} />
          </Pressable>
        ) : (
          <View style={styles.topButton} />
        )}
        {!isLast ? (
          <Pressable
            testID="onboarding-skip"
            onPress={() => void finish()}
            style={styles.topButton}
            accessibilityRole="button"
            accessibilityLabel="Skip the introduction"
            accessibilityHint="Goes straight to the app. Anything you chose so far is kept."
          >
            <Text style={styles.skipText} maxFontSizeMultiplier={fontScaleLimit.action}>
              Skip
            </Text>
          </Pressable>
        ) : (
          <View style={styles.topButton} />
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Step />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.md) }]}>
        <Text testID="onboarding-progress-text" style={styles.srOnly} accessibilityLiveRegion="polite">
          Step {index + 1} of {STEP_IDS.length}
        </Text>
        <View
          testID="onboarding-pagination"
          style={styles.dots}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${index + 1} of ${STEP_IDS.length}`}
          accessibilityValue={{ min: 1, max: STEP_IDS.length, now: index + 1 }}
        >
          {STEP_IDS.map((id, i) => (
            <View key={id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        {isLast ? (
          <>
            <Pressable
              testID="onboarding-finish"
              onPress={() => void finish()}
              style={styles.primary}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText} maxFontSizeMultiplier={fontScaleLimit.action}>
                Start reading
              </Text>
            </Pressable>
            <Pressable
              testID="onboarding-finish-settings"
              onPress={() => void finish({ openSettings: true })}
              style={styles.secondary}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryText} maxFontSizeMultiplier={fontScaleLimit.action}>
                Fine-tune settings first
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            testID="onboarding-next"
            onPress={() => goTo(index + 1)}
            style={styles.primary}
            accessibilityRole="button"
          >
            <Text style={styles.primaryText} maxFontSizeMultiplier={fontScaleLimit.action}>
              {index === 0 ? "Get started" : "Continue"}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    topBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.sm },
    topButton: { minWidth: 64, height: 44, alignItems: "center", justifyContent: "center" },
    skipText: { fontFamily: typography.fontFamily.sans, fontSize: 15, fontWeight: "600", color: colors.tintStrong },
    content: { paddingBottom: spacing.lg },
    footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: spacing.md },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.opaqueSeparator },
    dotActive: { width: 22, backgroundColor: colors.tintStrong },
    primary: {
      minHeight: 54,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.tintStrong,
    },
    primaryText: { fontFamily: typography.fontFamily.sans, fontSize: 17, fontWeight: "600", color: colors.onTintStrong },
    secondary: { minHeight: 48, marginTop: 6, alignItems: "center", justifyContent: "center" },
    secondaryText: { fontFamily: typography.fontFamily.sans, fontSize: 15, fontWeight: "600", color: colors.tintStrong },
    srOnly: { position: "absolute", width: 1, height: 1, opacity: 0 },
  });
