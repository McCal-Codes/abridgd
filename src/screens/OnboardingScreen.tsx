import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  CheckCircle,
  PauseCircle,
  Sliders,
  Wind,
} from "lucide-react-native";
import { ScaleButton } from "../components/ScaleButton";
import { AbridgedReader } from "../components/AbridgedReader";
import { useSettings, GroundingAnimationStyle } from "../context/SettingsContext";
import { RootStackParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabLayoutMode = "minimal" | "comprehensive";

type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  demo?: boolean;
  demoText?: string;
  grounding?: boolean;
  layoutChoice?: boolean;
  Icon: typeof BookOpen;
};

const SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Finally, a Good News App",
    description:
      "We know the struggle. You downloaded this because you could not find a news app that felt right. You are in luck, you found it.",
    Icon: BookOpen,
  },
  {
    id: "rsvp-demo",
    title: "Give Your Eyes a Break",
    description:
      "Doomscrolling is exhausting. Our RSVP reader shows you one word at a time, locked in place. It is surprisingly calm, like a massage for your brain.",
    demo: true,
    demoText:
      "We hope you find this reading experience to be incredibly peaceful and kind to your eyes, and if you are ever feeling hungry, remember that almost everything is better as chicken on a stick.",
    Icon: PauseCircle,
  },
  {
    id: "grounding",
    title: "Optional grounding",
    description:
      "For heavy stories, add a calm breathing cue. Optional, and changeable anytime in Settings > Reading.",
    grounding: true,
    Icon: Wind,
  },
  {
    id: "make-it-yours",
    title: "Make It Yours",
    description:
      "We do not do one size fits all. Change the colors, adjust the speed, or tweak the focus point. This is your quiet corner of the internet.",
    Icon: Sliders,
  },
  {
    id: "layout",
    title: "Choose Your Layout",
    description:
      "Start with the calm default or a category-first layout. You can change this later in Tab Bar Settings.",
    layoutChoice: true,
    Icon: Sliders,
  },
  {
    id: "ready",
    title: "Welcome Home",
    description:
      "No accounts, no tracking, no noise. Just the news, on your terms. We are glad you found us.",
    Icon: CheckCircle,
  },
];

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
        <Text style={[styles.groundingCardLabel, { fontSize: labelSize }]}>Grounding Mode</Text>
        <View style={styles.groundingStyleBadge}>
          <Text style={styles.groundingStyleBadgeText}>{selectedStyle.label}</Text>
        </View>
      </View>
      <View style={styles.groundingCardBody}>
        <View
          style={[
            styles.groundingPulse,
            { width: pulseSize, height: pulseSize, borderRadius: pulseSize / 2 },
          ]}
        >
          <Text style={[styles.groundingPulseText, isCompactHeight && { fontSize: 18 }]}>
            Inhale
          </Text>
          <Text style={styles.groundingPulseSubtext}>softly</Text>
        </View>
        <View style={styles.groundingDetails}>
          <Text style={styles.groundingStyleDescriptionPreview}>{selectedStyle.description}</Text>
          <View style={styles.breathRow}>
            {BREATH_SEGMENTS.map((segment) => (
              <View
                key={segment.label}
                style={[
                  styles.breathSegment,
                  { flex: segment.flex, backgroundColor: segment.color },
                ]}
              >
                <Text style={styles.breathSegmentLabel}>{segment.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.breathTiming}>4s in | 1s still | 6s out</Text>
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
      <Text style={[styles.groundingSelectorTitle, isCompactHeight && { fontSize: 16 }]}>
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
                    <Text style={[styles.groundingStyleLabel, isCompactHeight && { fontSize: 14 }]}>
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.groundingStyleDescription,
                        isCompactHeight && { fontSize: 11 },
                      ]}
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
      <Text style={[styles.groundingSelectorHint, isCompactHeight && { fontSize: 12 }]}>
        {"You can change this later in Settings > Reading."}
      </Text>
    </View>
  );
};

const LayoutSelector: React.FC<{
  value: TabLayoutMode;
  onChange: (layout: TabLayoutMode) => void;
  options: Array<{
    id: TabLayoutMode;
    title: string;
    description: string;
    tabs: string[];
    accent: string;
  }>;
}> = ({ value, onChange, options }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.layoutSelectorContainer}>
      <Text style={styles.layoutSelectorTitle}>Pick your tab layout</Text>
      <Text style={styles.layoutSelectorDescription}>
        This just sets your starting point. You can change it later in Settings.
      </Text>
      {options.map((option) => {
        const selected = option.id === value;

        return (
          <ScaleButton
            key={option.id}
            testID={`onboarding-layout-${option.id}`}
            onPress={() => onChange(option.id)}
            style={styles.layoutCard}
            accessibilityLabel={`Choose ${option.title} tab layout`}
            accessibilityState={{ selected }}
          >
            <View
              style={[
                styles.layoutCardBody,
                selected && {
                  borderColor: option.accent,
                  backgroundColor: `${option.accent}12`,
                },
              ]}
            >
              <View style={styles.layoutCardHeader}>
                <Text style={[styles.layoutCardTitle, selected && { color: option.accent }]}>
                  {option.title}
                </Text>
                {selected ? (
                  <View style={[styles.layoutSelectedBadge, { borderColor: option.accent }]}>
                    <Text style={[styles.layoutSelectedBadgeText, { color: option.accent }]}>
                      Selected
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.layoutCardDescription}>{option.description}</Text>
              <View style={styles.layoutTabRow}>
                {option.tabs.map((tab) => (
                  <View key={`${option.id}-${tab}`} style={styles.layoutTabPill}>
                    <Text style={styles.layoutTabText}>{tab}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScaleButton>
        );
      })}
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
    groundingAnimationStyle,
    setGroundingAnimationStyle,
    tabLayout,
    setTabLayout,
    reduceMotion,
  } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompactHeight = screenHeight < 720;
  const isMediumHeight = screenHeight >= 720 && screenHeight < 820;
  const demoHeight = isCompactHeight ? 170 : isMediumHeight ? 240 : 320;
  const footerBottomPadding = Math.max(spacing.xl, insets.bottom + spacing.lg);
  const slideBottomPadding = footerBottomPadding + spacing.lg;
  const [selectedGroundingStyle, setSelectedGroundingStyle] =
    useState<GroundingAnimationStyle>(groundingAnimationStyle);
  const [selectedLayout, setSelectedLayout] = useState<TabLayoutMode>(tabLayout);

  const layoutOptions = useMemo(
    () => [
      {
        id: "minimal" as const,
        title: "Minimal",
        description: "Calm default with Home, Discover, Saved, Digest, and Profile.",
        tabs: ["Home", "Discover", "Saved", "Digest", "Profile"],
        accent: colors.primary,
      },
      {
        id: "comprehensive" as const,
        title: "Comprehensive",
        description: "Category-first with Top and Local up front for quicker scanning.",
        tabs: ["Top", "Local", "Digest", "Saved", "Profile"],
        accent: colors.text,
      },
    ],
    [colors.primary, colors.text],
  );

  const scrollToSlide = useCallback(
    (index: number, animated = true) => {
      setCurrentIndex(index);
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index, animated });
      });
    },
    [],
  );

  useEffect(() => {
    setSelectedGroundingStyle(groundingAnimationStyle);
  }, [groundingAnimationStyle]);

  useEffect(() => {
    setSelectedLayout(tabLayout);
  }, [tabLayout]);

  useEffect(() => {
    const startId = route?.params?.startSlideId as string | undefined;
    if (!startId) return;

    const index = SLIDES.findIndex((slide) => slide.id === startId);
    if (index >= 0) {
      setCurrentIndex(index);
      const timeout = setTimeout(() => {
        listRef.current?.scrollToIndex({ index, animated: false });
      }, 50);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [route?.params]);

  const handleNext = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, SLIDES.length - 1);
    if (nextIndex === currentIndex) return;
    scrollToSlide(nextIndex, !reduceMotion);
  }, [currentIndex, reduceMotion, scrollToSlide]);

  const handleFinish = async (options?: { openReadingSettings?: boolean }) => {
    if (selectedGroundingStyle !== groundingAnimationStyle) {
      await setGroundingAnimationStyle(selectedGroundingStyle);
    }

    if (selectedLayout !== tabLayout) {
      await setTabLayout(selectedLayout);
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

          {item.layoutChoice ? (
            <LayoutSelector
              value={selectedLayout}
              onChange={setSelectedLayout}
              options={layoutOptions}
            />
          ) : null}

          {!item.demo && !item.grounding && !item.layoutChoice ? (
            <View style={styles.placeholder}>
              <item.Icon size={72} color={colors.text} strokeWidth={1.5} />
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        testID="onboarding-list"
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        initialNumToRender={SLIDES.length}
        windowSize={SLIDES.length}
        snapToInterval={width}
        snapToAlignment="start"
        decelerationRate={reduceMotion ? "normal" : "fast"}
        disableIntervalMomentum
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(nextIndex);
        }}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 50);
        }}
      />

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
                <Text style={styles.buttonText}>Get Started</Text>
              </View>
            </ScaleButton>

            <ScaleButton
              testID="onboarding-finish-reading-settings"
              style={[styles.button, styles.secondaryButton]}
              onPress={() => void handleFinish({ openReadingSettings: true })}
            >
              <View style={styles.secondaryBtnContent}>
                <Text style={styles.secondaryButtonText}>Fine-tune Settings Now</Text>
              </View>
            </ScaleButton>
          </View>
        ) : (
          <View style={styles.progressActions}>
            <ScaleButton testID="onboarding-next" style={styles.button} onPress={handleNext}>
              <View style={styles.primaryActionContent}>
                <Text style={styles.primaryActionText}>Next</Text>
              </View>
            </ScaleButton>

            <ScaleButton
              testID="onboarding-skip"
              style={[styles.button, styles.skipButton]}
              onPress={() => void handleFinish()}
            >
              <View style={styles.skipBtnContent}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
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
      fontFamily: typography.fontFamily.serif,
      fontSize: 26,
      fontWeight: "700",
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
      width: "72%",
      maxWidth: "72%",
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
    breathTiming: {
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
    layoutSelectorContainer: {
      width: "100%",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    layoutSelectorTitle: {
      fontFamily: typography.fontFamily.serif,
      fontSize: 22,
      color: colors.text,
      textAlign: "center",
    },
    layoutSelectorDescription: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: spacing.xs,
    },
    layoutCard: {
      width: "100%",
    },
    layoutCardBody: {
      width: "100%",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.sm,
    },
    layoutCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
    },
    layoutCardTitle: {
      fontFamily: typography.fontFamily.serif,
      fontSize: 19,
      color: colors.text,
    },
    layoutSelectedBadge: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
    },
    layoutSelectedBadgeText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 11,
      fontWeight: "700",
    },
    layoutCardDescription: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    layoutTabRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    layoutTabPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    layoutTabText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
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
      marginHorizontal: spacing.sm,
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
    },
    srOnly: {
      position: "absolute",
      height: 0,
      width: 0,
      opacity: 0,
    },
  });
