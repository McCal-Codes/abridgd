import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  Compass,
  PauseCircle,
  Wind,
} from "lucide-react-native";
import { ScaleButton } from "../components/ScaleButton";
import { getAllCategories } from "../services/feed/sourceRegistry";
import { WhatsNewView } from "./onboarding/WhatsNewView";
import { AbridgedReader } from "../components/AbridgedReader";
import { useSettings, GroundingAnimationStyle } from "../context/SettingsContext";
import { RootStackParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  demo?: boolean;
  demoText?: string;
  grounding?: boolean;
  preview?: "brief" | "sections";
  Icon: typeof BookOpen;
};

const SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Local news, abridged",
    description:
      "A short brief of what happened in Pittsburgh, from newsrooms that cover it. Read the summary, or open the whole story. Either way it ends.",
    preview: "brief",
    Icon: BookOpen,
  },
  {
    id: "sections",
    title: "Five sections, one place",
    description:
      "Top and Local for the day's news, then Business, Sports, and Culture when you want them. Every section pulls from several newsrooms, and you choose which ones.",
    preview: "sections",
    Icon: Compass,
  },
  {
    id: "reader",
    title: "One word at a time",
    description:
      "The Abridged reader holds each word in the same spot so your eyes stop hunting across the line. Try it here — tap play, and drag the speed wherever it feels right.",
    demo: true,
    demoText:
      "City council approved the riverfront plan on Tuesday after two years of hearings, clearing the way for construction to begin next spring.",
    Icon: PauseCircle,
  },
  {
    id: "grounding",
    title: "A breath before the hard ones",
    description:
      "Some stories land heavy. Turn on a short breathing cue before those, or skip it entirely — you can change this later in Settings.",
    grounding: true,
    Icon: Wind,
  },
];

/** Shown under the final slide's actions. These were a whole slide of their own, which spent
 * a full screen telling readers about the absence of things. */
const TRUST_POINTS = ["No account", "No tracking", "Nothing to configure"];

const BREATH_SEGMENTS = [
  { label: "In", flex: 4, color: "#3FA2A7" },
  { label: "Hold", flex: 1, color: "#7FC6C9" },
  { label: "Out", flex: 6, color: "#A3D8DA" },
];

const GROUNDING_STYLES: { id: GroundingAnimationStyle; label: string; description: string }[] = [
  { id: "simple", label: "Calm Loop", description: "Soft inhale / exhale, steady and classic." },
  { id: "waves", label: "Wave Drift", description: "Slow color drift with a softer feel." },
  { id: "pulse", label: "Focus Pulse", description: "Minimal ring motion for a quieter cue." },
];

const GROUNDING_STYLE_COLORS: Record<GroundingAnimationStyle, string> = {
  simple: "#3FA2A7",
  waves: "#7FC6C9",
  pulse: "#A3D8DA",
};
const PREVIEW_TEXT_SCALE = 1.25;
const CONTROL_TEXT_SCALE = 1.45;
const ACTION_TEXT_SCALE = 1.6;

const GroundingPreviewCard: React.FC<{
  isCompactHeight: boolean;
  currentStyle: GroundingAnimationStyle;
}> = ({ isCompactHeight, currentStyle }) => {
  const styles = useThemedStyles(createStyles);
  const pulseSize = isCompactHeight ? 74 : 94;
  const cardPadding = isCompactHeight ? spacing.sm : spacing.md;
  const labelSize = isCompactHeight ? 17 : 20;
  const selectedStyle = GROUNDING_STYLES.find((style) => style.id === currentStyle) || GROUNDING_STYLES[0];

  return (
    <View style={[styles.groundingCard, { padding: cardPadding }]}>
      <View style={styles.groundingCardHeader}>
        <Text
          style={[styles.groundingCardLabel, { fontSize: labelSize }]}
          maxFontSizeMultiplier={CONTROL_TEXT_SCALE}
        >
          Grounding Mode
        </Text>
        <View style={styles.groundingStyleBadge}>
          <Text style={styles.groundingStyleBadgeText} maxFontSizeMultiplier={CONTROL_TEXT_SCALE}>
            {selectedStyle.label}
          </Text>
        </View>
      </View>
      <View style={[styles.groundingCardBody, isCompactHeight && styles.groundingCardBodyCompact]}>
        <View
          style={[
            styles.groundingPulse,
            { width: pulseSize, height: pulseSize, borderRadius: pulseSize / 2 },
          ]}
        >
          <Text
            style={[styles.groundingPulseText, isCompactHeight && { fontSize: 18 }]}
            maxFontSizeMultiplier={CONTROL_TEXT_SCALE}
          >
            Inhale
          </Text>
          <Text style={styles.groundingPulseSubtext} maxFontSizeMultiplier={PREVIEW_TEXT_SCALE}>
            softly
          </Text>
        </View>
        <View style={styles.groundingDetails}>
          <Text
            style={styles.groundingStyleDescriptionPreview}
            maxFontSizeMultiplier={CONTROL_TEXT_SCALE}
          >
            {selectedStyle.description}
          </Text>
          <View style={styles.breathRow}>
            {BREATH_SEGMENTS.map((segment) => (
              <View
                key={segment.label}
                style={[
                  styles.breathSegment,
                  { flex: segment.flex, backgroundColor: segment.color },
                ]}
              >
                <Text style={styles.breathSegmentLabel} maxFontSizeMultiplier={PREVIEW_TEXT_SCALE}>
                  {segment.label}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.groundingChangeHint} maxFontSizeMultiplier={CONTROL_TEXT_SCALE}>
            Optional, short, and easy to skip.
          </Text>
        </View>
      </View>
    </View>
  );
};

const GroundingStyleSelector: React.FC<{
  value: GroundingAnimationStyle;
  onChange: (style: GroundingAnimationStyle) => void;
  isCompactHeight: boolean;
}> = ({ value, onChange, isCompactHeight }) => {
  const styles = useThemedStyles(createStyles);
  const { width: screenWidth } = useWindowDimensions();
  const horizontalPadding = isCompactHeight ? spacing.md : spacing.lg;
  const listPadding = spacing.xs;
  const cardWidth = Math.max(0, screenWidth - 2 * (horizontalPadding + listPadding));
  const cardPadding = isCompactHeight ? spacing.sm : spacing.md;

  return (
    <View style={styles.groundingSelectorContainer}>
      <Text
        style={[styles.groundingSelectorTitle, isCompactHeight && { fontSize: 16 }]}
        maxFontSizeMultiplier={CONTROL_TEXT_SCALE}
      >
        Pick your grounding feel
      </Text>
      <FlatList
        horizontal
        data={GROUNDING_STYLES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groundingSelectorList}
        renderItem={({ item }) => {
          const selected = item.id === value;
          const swatchColor = GROUNDING_STYLE_COLORS[item.id];

          return (
            <ScaleButton
              testID={`onboarding-grounding-${item.id}`}
              onPress={() => onChange(item.id)}
              style={{ width: cardWidth }}
              accessibilityLabel={`Select ${item.label} grounding style`}
              accessibilityState={{ selected }}
            >
              <View
                style={[
                  styles.groundingStyleCard,
                  { padding: cardPadding },
                  selected && styles.groundingStyleCardSelected,
                ]}
              >
                <View style={styles.groundingStyleHeaderRow}>
                  <View style={[styles.groundingStyleSwatch, { backgroundColor: swatchColor }]} />
                  <View style={styles.groundingStyleTextColumn}>
                    <Text
                      style={[styles.groundingStyleLabel, isCompactHeight && { fontSize: 14 }]}
                      maxFontSizeMultiplier={CONTROL_TEXT_SCALE}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.groundingStyleDescription,
                        isCompactHeight && { fontSize: 11 },
                      ]}
                      maxFontSizeMultiplier={CONTROL_TEXT_SCALE}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.groundingStyleMiniBar}>
                  <View
                    style={[styles.groundingStyleMiniBarFill, { backgroundColor: swatchColor }]}
                  />
                </View>
              </View>
            </ScaleButton>
          );
        }}
      />
      <Text
        style={[styles.groundingSelectorHint, isCompactHeight && { fontSize: 12 }]}
        maxFontSizeMultiplier={CONTROL_TEXT_SCALE}
      >
        {"You can change this later in Settings > Reading."}
      </Text>
    </View>
  );
};

const BriefPreview: React.FC = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.previewCard}>
      <View style={styles.previewHeaderRow}>
        <Text style={styles.previewEyebrow} maxFontSizeMultiplier={PREVIEW_TEXT_SCALE}>
          Morning Brief
        </Text>
        <Text style={styles.previewTimestamp} maxFontSizeMultiplier={PREVIEW_TEXT_SCALE}>
          Updated 8:15 AM
        </Text>
      </View>
      <Text style={styles.previewTitle} maxFontSizeMultiplier={PREVIEW_TEXT_SCALE}>
        Today at a glance
      </Text>
      <View style={styles.previewDivider} />
      {["Top story, short summary", "Local updates", "Continue reading"].map((item) => (
        <View key={item} style={styles.previewLineRow}>
          <View style={styles.previewDot} />
          <Text style={styles.previewLineText} maxFontSizeMultiplier={PREVIEW_TEXT_SCALE}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
};

const SectionsPreview: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const categories = getAllCategories();

  return (
    <View style={styles.previewCard}>
      <Text style={styles.previewEyebrow} maxFontSizeMultiplier={PREVIEW_TEXT_SCALE}>
        Sections
      </Text>
      <View style={styles.sectionChipRow}>
        {categories.map((category, index) => (
          <View
            key={category}
            style={[styles.sectionChip, index === 0 && styles.sectionChipActive]}
          >
            <Text
              style={[styles.sectionChipText, index === 0 && styles.sectionChipTextActive]}
              maxFontSizeMultiplier={PREVIEW_TEXT_SCALE}
            >
              {category}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.previewDivider} />
      {["WESA", "Post-Gazette", "PublicSource"].map((item) => (
        <View key={item} style={styles.previewLineRow}>
          <View style={styles.previewDot} />
          <Text style={styles.previewLineText} maxFontSizeMultiplier={PREVIEW_TEXT_SCALE}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
};

export const OnboardingScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const {
    completeOnboarding,
    markVersionSeen,
    groundingAnimationStyle,
    setGroundingAnimationStyle,
    reduceMotion,
  } = useSettings();
  const mode = (route?.params?.mode as "firstRun" | "whatsNew" | undefined) ?? "firstRun";
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<ScrollView>(null);
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompactHeight = screenHeight < 720;
  const isMediumHeight = screenHeight >= 720 && screenHeight < 820;
  const demoHeight = isCompactHeight ? 170 : isMediumHeight ? 240 : 320;
  const footerBottomPadding = Math.max(spacing.xl, insets.bottom + spacing.lg);
  const slideBottomPadding = footerBottomPadding + spacing.lg;
  const [selectedGroundingStyle, setSelectedGroundingStyle] =
    useState<GroundingAnimationStyle>(groundingAnimationStyle);

  const scrollToSlide = useCallback(
    (index: number, animated = true) => {
      setCurrentIndex(index);
      listRef.current?.scrollTo({ x: index * width, animated });
    },
    [width],
  );

  useEffect(() => {
    setSelectedGroundingStyle(groundingAnimationStyle);
  }, [groundingAnimationStyle]);

  useEffect(() => {
    const startId = route?.params?.startSlideId as string | undefined;
    if (!startId) return;

    const index = SLIDES.findIndex((slide) => slide.id === startId);
    if (index >= 0) {
      setCurrentIndex(index);
      const timeout = setTimeout(() => {
        listRef.current?.scrollTo({ x: index * width, animated: false });
      }, 50);

      return () => clearTimeout(timeout);
    }

    // Silently ignoring an unknown id is how `startSlideId: "whats-new"` shipped: it matched
    // no slide, so every returning reader got the first-run flow from slide one instead.
    if (__DEV__) {
      console.warn(`[Onboarding] startSlideId "${startId}" matches no slide.`);
    }

    return undefined;
  }, [route?.params, width]);

  const handleNext = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, SLIDES.length - 1);
    if (nextIndex === currentIndex) return;
    scrollToSlide(nextIndex, !reduceMotion);
  }, [currentIndex, reduceMotion, scrollToSlide]);

  const handleFinish = async (options?: { openReadingSettings?: boolean }) => {
    if (selectedGroundingStyle !== groundingAnimationStyle) {
      await setGroundingAnimationStyle(selectedGroundingStyle);
    }

    await completeOnboarding();

    if (options?.openReadingSettings) {
      navigation.reset({
        index: 2,
        routes: [{ name: "Main" }, { name: "Settings" }, { name: "ReadingSettings" }],
      });
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  const renderItem = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.slideScrollContent,
            styles.slideContent,
            (isCompactHeight || isMediumHeight) && styles.slideContentCompact,
            { paddingBottom: slideBottomPadding },
          ]}
        >
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                isMediumHeight && styles.titleMedium,
                isCompactHeight && styles.titleCompact,
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.description,
                isMediumHeight && styles.descriptionMedium,
                isCompactHeight && styles.descriptionCompact,
              ]}
            >
              {item.description}
            </Text>
          </View>

          {item.demo && item.demoText ? (
            <View style={[styles.demoContainer, { minHeight: demoHeight }]}>
              <AbridgedReader content={item.demoText} />
            </View>
          ) : null}

          {item.grounding ? (
            <View style={styles.groundingPreviewWrapper}>
              <GroundingPreviewCard
                isCompactHeight={isCompactHeight}
                currentStyle={selectedGroundingStyle}
              />
              <GroundingStyleSelector
                value={selectedGroundingStyle}
                onChange={setSelectedGroundingStyle}
                isCompactHeight={isCompactHeight}
              />
            </View>
          ) : null}

          {item.preview === "brief" ? (
            <BriefPreview />
          ) : null}

          {item.preview === "sections" ? (
            <SectionsPreview />
          ) : null}

          {!item.demo && !item.grounding && !item.preview ? (
            <View style={styles.placeholder}>
              <item.Icon size={72} color={colors.text} strokeWidth={1.5} />
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={listRef}
        testID="onboarding-list"
        horizontal
        pagingEnabled
        snapToInterval={width}
        snapToAlignment="start"
        decelerationRate={reduceMotion ? "normal" : "fast"}
        disableIntervalMomentum
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(nextIndex);
        }}
      >
        {SLIDES.map((item) => (
          <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          isCompactHeight && styles.footerCompact,
          { paddingBottom: footerBottomPadding },
        ]}
      >
        <Text testID="onboarding-progress-text" style={styles.srOnly} accessibilityLiveRegion="polite">
          Onboarding progress: slide {currentIndex + 1} of {SLIDES.length}
        </Text>

        <View
          testID="onboarding-pagination"
          style={styles.pagination}
          accessibilityRole="progressbar"
          accessibilityLabel={`Onboarding progress: slide ${currentIndex + 1} of ${SLIDES.length}`}
          accessibilityValue={{ min: 1, max: SLIDES.length, now: currentIndex + 1 }}
        >
          {SLIDES.map((slide, index) => (
            <View
              key={slide.id}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        {currentIndex === SLIDES.length - 1 ? (
          <View style={styles.finishActions}>
            <ScaleButton
              testID="onboarding-finish"
              style={styles.button}
              onPress={() => void handleFinish()}
            >
              <View style={styles.finishBtn}>
                <Text style={styles.buttonText} maxFontSizeMultiplier={ACTION_TEXT_SCALE}>
                  Start reading
                </Text>
              </View>
            </ScaleButton>

            <ScaleButton
              testID="onboarding-finish-reading-settings"
              style={[styles.button, styles.secondaryButton]}
              onPress={() => void handleFinish({ openReadingSettings: true })}
            >
              <View style={styles.secondaryBtnContent}>
                <Text
                  style={styles.secondaryButtonText}
                  maxFontSizeMultiplier={ACTION_TEXT_SCALE}
                >
                  Fine-tune settings
                </Text>
              </View>
            </ScaleButton>

            <View style={styles.trustRow} testID="onboarding-trust">
              {TRUST_POINTS.map((point) => (
                <Text key={point} style={styles.trustText} maxFontSizeMultiplier={1.4}>
                  {point}
                </Text>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.progressActions}>
            <ScaleButton testID="onboarding-next" style={styles.button} onPress={handleNext}>
              <View style={styles.primaryActionContent}>
                <Text style={styles.primaryActionText} maxFontSizeMultiplier={ACTION_TEXT_SCALE}>
                  Next
                </Text>
              </View>
            </ScaleButton>

            <ScaleButton
              testID="onboarding-skip"
              style={[styles.button, styles.skipButton]}
              onPress={() => void handleFinish()}
            >
              <View style={styles.skipBtnContent}>
                <Text style={styles.skipButtonText} maxFontSizeMultiplier={ACTION_TEXT_SCALE}>
                  Skip for now
                </Text>
              </View>
            </ScaleButton>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    slide: {
      flex: 1,
    },
    slideScrollContent: {
      flexGrow: 1,
      justifyContent: "flex-start",
    },
    slideContent: {
      width: "100%",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      alignItems: "center",
      gap: spacing.sm,
    },
    slideContentCompact: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      gap: spacing.xs,
    },
    textContainer: {
      alignItems: "center",
      gap: spacing.xs,
    },
    title: {
      fontFamily: typography.fontFamily.serifBold,
      fontSize: 26,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    titleMedium: {
      fontSize: 30,
    },
    titleCompact: {
      fontSize: 23,
    },
    description: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: spacing.md,
    },
    descriptionMedium: {
      fontSize: 17,
    },
    descriptionCompact: {
      fontSize: 14,
      lineHeight: 18,
      paddingHorizontal: spacing.sm,
    },
    demoContainer: {
      width: "100%",
      flexShrink: 1,
    },
    groundingPreviewWrapper: {
      width: "100%",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    groundingCard: {
      width: "100%",
      borderRadius: 18,
      backgroundColor: colors.surface,
      gap: spacing.xs,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
    },
    groundingCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
      flexWrap: "wrap",
    },
    groundingCardLabel: {
      fontFamily: typography.fontFamily.serif,
      fontSize: 19,
      color: colors.text,
    },
    groundingCardBody: {
      flexDirection: "row",
      gap: spacing.sm,
      alignItems: "center",
    },
    groundingCardBodyCompact: {
      flexDirection: "column",
      alignItems: "stretch",
    },
    groundingPulse: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.tintTransparent,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    groundingPulseText: {
      fontFamily: typography.fontFamily.serif,
      fontSize: 20,
      color: colors.text,
    },
    groundingPulseSubtext: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: colors.textSecondary,
    },
    groundingDetails: {
      flex: 1,
      gap: spacing.xs,
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: spacing.sm,
      paddingLeft: spacing.md,
    },
    breathRow: {
      flexDirection: "row",
      width: "100%",
      maxWidth: 220,
      alignSelf: "flex-start",
      borderRadius: 999,
      overflow: "hidden",
      height: 10,
      marginVertical: spacing.xs,
    },
    breathSegment: {
      justifyContent: "center",
      alignItems: "center",
    },
    breathSegmentLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 8,
      color: colors.surface,
      fontWeight: "600",
    },
    groundingChangeHint: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 11,
      color: colors.textSecondary,
    },
    groundingStyleBadge: {
      borderRadius: 999,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      maxWidth: "100%",
    },
    groundingStyleBadgeText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    groundingStyleDescriptionPreview: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 11,
      color: colors.textSecondary,
      lineHeight: 15,
      textAlign: "left",
    },
    groundingSelectorContainer: {
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    groundingSelectorTitle: {
      fontFamily: typography.fontFamily.serif,
      fontSize: 17,
      color: colors.text,
      textAlign: "center",
    },
    groundingSelectorList: {
      gap: spacing.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    groundingStyleCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.xs,
      alignItems: "flex-start",
      justifyContent: "center",
      width: "100%",
      minHeight: 96,
      marginBottom: spacing.sm,
    },
    groundingStyleCardSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}08`,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    groundingSelectorHint: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },
    groundingStyleHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      width: "100%",
    },
    groundingStyleSwatch: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    groundingStyleTextColumn: {
      flex: 1,
      gap: spacing.xs,
    },
    groundingStyleLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    groundingStyleDescription: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    groundingStyleMiniBar: {
      width: "100%",
      height: 6,
      borderRadius: 999,
      backgroundColor: colors.border,
      overflow: "hidden",
    },
    groundingStyleMiniBarFill: {
      width: "70%",
      height: "100%",
      borderRadius: 999,
    },
    previewCard: {
      width: "100%",
      maxWidth: 380,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    previewHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
      flexWrap: "wrap",
    },
    previewEyebrow: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    previewTimestamp: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.textSecondary,
    },
    previewTitle: {
      fontFamily: typography.fontFamily.serifBold,
      fontSize: 22,
      color: colors.text,
    },
    previewDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      width: "100%",
    },
    previewLineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    previewDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    previewLineText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 15,
      color: colors.text,
      flex: 1,
      flexShrink: 1,
    },
    placeholder: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
    },
    footer: {
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.sm,
      alignItems: "center",
    },
    footerCompact: {
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.sm,
      alignItems: "center",
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 24,
      backgroundColor: colors.primary,
    },
    button: {
      width: "100%",
      maxWidth: 380,
    },
    finishActions: {
      width: "100%",
      gap: spacing.md,
      alignItems: "center",
    },
    progressActions: {
      width: "100%",
      gap: spacing.sm,
      alignItems: "center",
    },
    finishBtn: {
      backgroundColor: colors.text,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 12,
      alignItems: "center",
    },
    buttonText: {
      color: colors.surface,
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
    },
    primaryActionContent: {
      borderRadius: 12,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      backgroundColor: colors.text,
    },
    primaryActionText: {
      color: colors.surface,
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
    },
    secondaryButton: {
      borderRadius: 12,
    },
    secondaryBtnContent: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      backgroundColor: colors.surface,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: typography.fontFamily.sans,
      fontWeight: "600",
      textAlign: "center",
    },
    skipButton: {
      borderRadius: 12,
    },
    skipBtnContent: {
      borderRadius: 12,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      backgroundColor: colors.surface,
    },
    skipButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontFamily: typography.fontFamily.sans,
      fontWeight: "600",
      textAlign: "center",
    },
    sectionChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  sectionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sectionChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionChipTextActive: {
    color: colors.background,
    fontWeight: "600",
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  trustText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  srOnly: {
      position: "absolute",
      height: 0,
      width: 0,
      opacity: 0,
    },
  });
