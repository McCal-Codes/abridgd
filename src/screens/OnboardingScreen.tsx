import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  ScrollView,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { ScaleButton } from "../components/ScaleButton";
import { useSettings } from "../context/SettingsContext";
import { RootStackParamList } from "../navigation/types";
import { useTheme, Colors } from "../theme/ThemeContext";

import { AbridgedReader } from "../components/AbridgedReader";
import { BookOpen, PauseCircle, Wind, Sliders, CheckCircle, User } from "lucide-react-native";
import { GroundingAnimationStyle } from "../context/SettingsContext";
import { TabLayoutMode } from "../navigation/tabs";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OnboardingStyles = ReturnType<typeof createStyles>;

const SLIDES = [
  {
    id: "welcome",
    title: "Finally, a Good News App",
    description:
      "We know the struggle. You downloaded this because you could not find a news app that felt right. You are in luck, you found it.",
    demo: false,
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
      "For heavy stories, add a calm breathing cue. Optional, and changeable anytime in Settings → Reading.",
    demo: false,
    grounding: true,
    Icon: Wind,
  },
  {
    id: "make-it-yours",
    title: "Make It Yours",
    description:
      "We don't do 'one size fits all.' Change the colors, adjust the speed, or tweak the focus point. This is your quiet corner of the internet.",
    demo: false,
    Icon: Sliders,
  },
  {
    id: "layout",
    title: "Choose Your Layout",
    description:
      "Simple for just the essentials, Standard for most people, or Power if you want every tab ready.",
    demo: false,
    layoutChoice: true,
    Icon: Sliders,
  },
  {
    id: "profile-intro",
    title: "Your Profile",
    description:
      "Track your reading journey with stats, achievements, and a unique codename. Your progress stays private and on-device.",
    demo: false,
    profile: true,
    Icon: User,
  },
  {
    id: "ready",
    title: "Welcome Home",
    description:
      "No accounts, no tracking, no noise. Just the news, on your terms. We're glad you found us.",
    demo: false,
    Icon: CheckCircle,
  },
];

const GROUNDING_POINTS = ["Optional before tough reads", "≈30s steady loop"];

const GROUNDING_STYLES: { id: GroundingAnimationStyle; label: string; description: string }[] = [
  { id: "simple", label: "Calm Loop", description: "Soft inhale / exhale — classic." },
  { id: "waves", label: "Wave Drift", description: "Slow gradients, like tide coming in." },
  { id: "pulse", label: "Focus Pulse", description: "Minimal ring, steady and quiet." },
];

const GroundingPreviewCard: React.FC<{
  isCompactHeight: boolean;
  currentStyle: GroundingAnimationStyle;
  styles: OnboardingStyles;
  breathSegments: { label: string; flex: number; color: string }[];
  styleOverride?: any;
}> = ({ isCompactHeight, currentStyle, styles, breathSegments, styleOverride }) => {
  if (!styles) return null;
  const pulseSize = isCompactHeight ? 68 : 96;
  const cardPadding = isCompactHeight ? spacing.sm : spacing.md + spacing.xs;
  const labelSize = isCompactHeight ? 17 : 20;
  const metaSize = isCompactHeight ? 13 : 14;
  const selectedStyle = GROUNDING_STYLES.find((s) => s.id === currentStyle) || GROUNDING_STYLES[0];
  const bodyDirection = isCompactHeight ? "column" : "row";

  return (
    <View style={[styles.groundingCard, { padding: cardPadding }, styleOverride]}>
      <View style={styles.groundingCardHeader}>
        <Text style={[styles.groundingCardLabel, { fontSize: labelSize }]}>Grounding Mode</Text>
        <View style={styles.groundingStyleBadge}>
          <Text style={styles.groundingStyleBadgeText}>{selectedStyle.label}</Text>
        </View>
      </View>
      <Text style={[styles.groundingCardMeta, { fontSize: metaSize }]}>
        Gentle breath cues, tuned like the RSVP demo to stay calm and within view.
      </Text>
      <View
        style={[
          styles.groundingCardBodySimple,
          {
            flexDirection: bodyDirection,
            alignItems: "center",
            gap: isCompactHeight ? spacing.sm : spacing.sm,
          },
        ]}
      >
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
        <View style={[styles.groundingDetails, isCompactHeight && styles.groundingDetailsCompact]}>
          <Text style={styles.groundingStyleDescriptionPreview}>{selectedStyle.description}</Text>
          <View style={styles.breathRow}>
            {breathSegments.map((seg) => (
              <View
                key={seg.label}
                style={[styles.breathSegment, { flex: seg.flex, backgroundColor: seg.color }]}
              >
                <Text style={styles.breathSegmentLabel}>{seg.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.breathTiming}>4s in · 1s still · 6s out</Text>
        </View>
      </View>
    </View>
  );
};

const GroundingStyleSelector: React.FC<{
  value: GroundingAnimationStyle;
  onChange: (style: GroundingAnimationStyle) => void;
  isCompactHeight: boolean;
  styles: OnboardingStyles;
  groundingStyleColors: Record<GroundingAnimationStyle, string>;
  reduceMotion: boolean;
}> = ({ value, onChange, isCompactHeight, styles, groundingStyleColors, reduceMotion }) => {
  if (!styles) return null;
  const { width: screenWidth } = useWindowDimensions();
  const listPadding = spacing.xs;
  const cardGap = isCompactHeight ? spacing.sm : spacing.md;
  const horizontalPadding = spacing.lg;
  const cardWidth = Math.max(0, screenWidth - 2 * horizontalPadding - cardGap);
  const cardPadding = isCompactHeight ? spacing.sm : spacing.md;
  const snapInterval = cardWidth + cardGap;

  return (
    <View style={styles.groundingSelectorContainer}>
      <Text style={[styles.groundingSelectorTitle, isCompactHeight && { fontSize: 16 }]}>
        Pick your grounding feel
      </Text>
      <View style={styles.miniPreviewRow}>
        {GROUNDING_STYLES.map((style) => {
          const active = style.id === value;
          return (
            <ScaleButton
              key={style.id}
              onPress={() => onChange(style.id)}
              style={[styles.miniPreviewBtn, active && styles.miniPreviewPillActive]}
              hitSlop={12}
              disableScale={reduceMotion}
              accessibilityLabel={`Select ${style.label} grounding style`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <View style={styles.miniPreviewPill}>
                <Text style={[styles.miniPreviewLabel, active && styles.miniPreviewLabelActive]}>
                  {style.label}
                </Text>
              </View>
            </ScaleButton>
          );
        })}
      </View>
      <FlatList
        horizontal
        data={GROUNDING_STYLES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={[
          styles.groundingSelectorList,
          isCompactHeight && styles.groundingSelectorListCompact,
          {
            paddingHorizontal: horizontalPadding,
            paddingRight: horizontalPadding + cardGap,
            gap: cardGap,
          },
        ]}
        renderItem={({ item }) => {
          const selected = item.id === value;
          const swatchColor = groundingStyleColors[item.id];
          return (
            <ScaleButton
              onPress={() => onChange(item.id)}
              style={{ width: cardWidth }}
              hitSlop={12}
              disableScale={reduceMotion}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Select ${item.label} grounding style`}
            >
              <View
                style={[
                  styles.groundingStyleCard,
                  isCompactHeight && styles.groundingStyleCardCompact,
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
        You can change this later in Settings → Reading.
      </Text>
    </View>
  );
};

const TabPreviewPills: React.FC<{
  tabs: string[];
  accent: string;
  isCompactHeight: boolean;
  styles: OnboardingStyles;
  colors: Colors;
}> = ({ tabs, accent, isCompactHeight, styles, colors }) => {
  if (!styles) return null;
  return (
    <View style={[styles.layoutTabRow, isCompactHeight && styles.layoutTabRowCompact]}>
      {tabs.map((tab, index) => (
        <View
          key={`${tab}-${index}`}
          style={[
            styles.layoutTabPill,
            {
              borderColor: index === 0 ? accent : colors.border,
              backgroundColor: index === 0 ? accent + "12" : colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.layoutTabText,
              index === 0 && { color: accent },
              isCompactHeight && { fontSize: 11 },
            ]}
          >
            {tab}
          </Text>
        </View>
      ))}
    </View>
  );
};

const LayoutOptionCard: React.FC<{
  option: {
    id: TabLayoutMode;
    title: string;
    description: string;
    tabs: string[];
    accent: string;
  };
  selected: boolean;
  onSelect: () => void;
  isCompactHeight: boolean;
  styles: OnboardingStyles;
  colors: Colors;
  reduceMotion: boolean;
}> = ({ option, selected, onSelect, isCompactHeight, styles, colors, reduceMotion }) => {
  if (!styles) return null;
  return (
    <ScaleButton
      onPress={onSelect}
      style={styles.layoutCard}
      hitSlop={12}
      disableScale={reduceMotion}
      accessibilityLabel={`Choose ${option.title} layout`}
      accessibilityState={{ selected }}
    >
      <View
        style={[
          styles.layoutCardBody,
          isCompactHeight && styles.layoutCardBodyCompact,
          selected && { borderColor: option.accent, backgroundColor: option.accent + "0F" },
        ]}
      >
        <View style={styles.layoutCardHeader}>
          <Text
            style={[
              styles.layoutTitle,
              selected && { color: option.accent },
              isCompactHeight && styles.layoutTitleCompact,
            ]}
          >
            {option.title}
          </Text>
          {selected && (
            <View style={[styles.layoutBadge, { borderColor: option.accent }]}>
              <Text style={[styles.layoutBadgeText, { color: option.accent }]}>Selected</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.layoutDescription,
            isCompactHeight && styles.layoutDescriptionCompact,
            selected && { color: option.accent },
          ]}
        >
          {option.description}
        </Text>
        <TabPreviewPills
          tabs={option.tabs}
          accent={option.accent}
          isCompactHeight={isCompactHeight}
          styles={styles}
          colors={colors}
        />
      </View>
    </ScaleButton>
  );
};

const LayoutSelector: React.FC<{
  value: TabLayoutMode;
  onChange: (layout: TabLayoutMode) => void;
  isCompactHeight: boolean;
  options: {
    id: TabLayoutMode;
    title: string;
    description: string;
    tabs: string[];
    accent: string;
  }[];
  styles: OnboardingStyles;
  colors: Colors;
  reduceMotion: boolean;
}> = ({ value, onChange, isCompactHeight, options, styles, colors, reduceMotion }) =>
  !styles ? null : (
    <View style={styles.layoutSelectorContainer}>
      <Text style={[styles.layoutSelectorTitle, isCompactHeight && { fontSize: 16 }]}>
        Pick your starting layout
      </Text>
      <Text style={[styles.layoutSelectorSubtitle, isCompactHeight && { fontSize: 13 }]}>
        You can switch anytime in Settings → Tab Bar Studio.
      </Text>
      <View style={styles.layoutGrid}>
        {options.map((option) => (
          <LayoutOptionCard
            key={option.id}
            option={option}
            selected={option.id === value}
            onSelect={() => onChange(option.id)}
            isCompactHeight={isCompactHeight}
            styles={styles}
            colors={colors}
            reduceMotion={reduceMotion}
          />
        ))}
      </View>
    </View>
  );
export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { colors, colorScheme, setColorSchemeOverride } = useTheme();
  const layoutOptions = React.useMemo(
    () => [
      {
        id: "simple" as const,
        title: "Simple",
        description: "News and Settings only—no extra chrome.",
        tabs: ["Home", "Settings"],
        accent: colors.primary,
      },
      {
        id: "standard" as const,
        title: "Everyday",
        description: "Balanced Home, Discover, Saved, Digest, Profile.",
        tabs: ["Home", "Discover", "Saved", "Digest", "Profile"],
        accent: colors.tint,
      },
      {
        id: "power" as const,
        title: "Power User",
        description: "Top + Local feeds with Digest and quick saves.",
        tabs: ["Top", "Local", "Digest", "Saved", "Profile"],
        accent: colors.text,
      },
    ],
    [colors.primary, colors.tint, colors.text],
  );
  const {
    completeOnboarding,
    groundingAnimationStyle,
    setGroundingAnimationStyle,
    tabLayout,
    setTabLayout,
  } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const { width, height: screenHeight, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);
  const isCompactHeight = screenHeight < 720;
  const isMediumHeight = screenHeight >= 720 && screenHeight < 820;
  const demoHeight = isCompactHeight ? 120 : isMediumHeight ? 220 : 300;
  const { reduceMotion } = useSettings();
  const [selectedGroundingStyle, setSelectedGroundingStyle] =
    useState<GroundingAnimationStyle>(groundingAnimationStyle);
  const [selectedLayout, setSelectedLayout] = useState<TabLayoutMode>(tabLayout);
  const [comfortDark, setComfortDark] = useState(colorScheme === "dark");
  const footerBottomPadding = Math.max(spacing.lg, insets.bottom + spacing.md);
  const contentBottomPadding = footerBottomPadding + (isCompactHeight ? spacing.sm : spacing.xl);
  const groundingStyleColors = React.useMemo(
    () => ({
      simple: colors.tint,
      waves: colors.tintTransparent,
      pulse: `${colors.tint}66`,
    }),
    [colors.tint, colors.tintTransparent],
  );
  const breathSegments = React.useMemo(
    () => [
      { label: "In", flex: 4, color: colors.tintTransparent },
      { label: "Hold", flex: 1, color: `${colors.tint}40` },
      { label: "Out", flex: 6, color: `${colors.tint}26` },
    ],
    [colors.tint, colors.tintTransparent],
  );

  useEffect(() => {
    setSelectedGroundingStyle(groundingAnimationStyle);
  }, [groundingAnimationStyle]);

  useEffect(() => {
    setSelectedLayout(tabLayout);
  }, [tabLayout]);

  const handleComfortToggle = useCallback(
    async (value: boolean) => {
      setComfortDark(value);
      await setColorSchemeOverride(value ? "dark" : null);
    },
    [setColorSchemeOverride],
  );

  const handleGroundingChange = useCallback(
    (style: GroundingAnimationStyle) => {
      setSelectedGroundingStyle(style);
      void setGroundingAnimationStyle(style);
    },
    [setGroundingAnimationStyle],
  );

  const handleLayoutChange = useCallback(
    (layout: TabLayoutMode) => {
      setSelectedLayout(layout);
      void setTabLayout(layout);
    },
    [setTabLayout],
  );

  // Optional deep-link to a specific slide by id
  useEffect(() => {
    const startId = route?.params?.startSlideId as string | undefined;
    if (!startId) return;
    const idx = SLIDES.findIndex((s) => s.id === startId);
    if (idx >= 0) {
      setCurrentIndex(idx);
      // slight delay to ensure list is measured
      setTimeout(() => listRef.current?.scrollToIndex({ index: idx, animated: false }), 50);
    }
  }, [route?.params]);

  const handleFinish = async (options?: { openReadingSettings?: boolean }) => {
    // Persist grounding choice if changed during onboarding
    if (selectedGroundingStyle && selectedGroundingStyle !== groundingAnimationStyle) {
      await setGroundingAnimationStyle(selectedGroundingStyle);
    }
    if (selectedLayout && selectedLayout !== tabLayout) {
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

  const renderItem = ({ item }: { item: (typeof SLIDES)[0] }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.slideContent,
            styles.slideScrollContent,
            (isCompactHeight || isMediumHeight) && styles.slideContentCompact,
            { paddingBottom: contentBottomPadding },
          ]}
        >
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                isMediumHeight && styles.titleMedium,
                isCompactHeight && styles.titleCompact,
              ]}
              allowFontScaling
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.description,
                isMediumHeight && styles.descriptionMedium,
                isCompactHeight && styles.descriptionCompact,
              ]}
              allowFontScaling
            >
              {item.description}
            </Text>
          </View>

          {/* Live Demos */}
          {item.demo && item.demoText && (
            <View style={[styles.demoContainer, { minHeight: demoHeight }]}>
              <AbridgedReader
                content={item.demoText}
                variant={isCompactHeight || isMediumHeight ? "compact" : "default"}
              />
            </View>
          )}

          {/* Grounding Preview */}
          {item.grounding && (
            <View style={styles.groundingPreviewWrapper}>
              <GroundingPreviewCard
                isCompactHeight={isCompactHeight}
                currentStyle={selectedGroundingStyle}
                styles={styles}
                breathSegments={breathSegments}
                styleOverride={isCompactHeight ? styles.groundingCardCompact : undefined}
              />
              <GroundingStyleSelector
                value={selectedGroundingStyle}
                onChange={handleGroundingChange}
                isCompactHeight={isCompactHeight}
                styles={styles}
                groundingStyleColors={groundingStyleColors}
                reduceMotion={reduceMotion}
              />
            </View>
          )}

          {item.layoutChoice && (
            <LayoutSelector
              value={selectedLayout}
              onChange={handleLayoutChange}
              isCompactHeight={isCompactHeight}
              options={layoutOptions}
              styles={styles}
              colors={colors}
              reduceMotion={reduceMotion}
            />
          )}

          {item.layoutChoice && (
            <View style={styles.comfortContainer}>
              <View style={styles.comfortHeader}>
                <Text style={styles.comfortTitle} allowFontScaling>
                  Be kind to your eyes
                </Text>
                <Switch
                  value={comfortDark}
                  onValueChange={handleComfortToggle}
                  thumbColor={comfortDark ? colors.surface : colors.surface}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <Text style={styles.comfortBody} allowFontScaling>
                Prefer a darker, calmer background for night reading. You can change this anytime in
                Settings.
              </Text>
            </View>
          )}

          {/* Static Icon Placeholder */}
          {!item.demo && !item.grounding && !item.layoutChoice && (
            <View style={styles.placeholder}>
              {item.Icon && <item.Icon size={72} color={colors.text} strokeWidth={1.5} />}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        snapToInterval={width}
        snapToAlignment="start"
        decelerationRate={reduceMotion ? "normal" : "fast"}
        disableIntervalMomentum
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
        scrollEnabled={!reduceMotion || SLIDES.length <= 1}
      />

      <View
        style={[
          styles.footer,
          isCompactHeight && styles.footerCompact,
          { paddingBottom: footerBottomPadding },
        ]}
      >
        <Text
          style={styles.srOnly}
          accessibilityLiveRegion="polite"
          importantForAccessibility="yes"
        >
          Onboarding progress: slide {currentIndex + 1} of {SLIDES.length}
        </Text>
        <View
          style={styles.pagination}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: SLIDES.length, now: currentIndex + 1 }}
          accessibilityLabel={`Onboarding progress: slide ${currentIndex + 1} of ${SLIDES.length}`}
          importantForAccessibility="yes"
        >
          {SLIDES.map((_, index) => (
            <View
              key={index}
              accessibilityLabel={`Slide ${index + 1} of ${SLIDES.length}`}
              accessibilityRole="text"
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        {currentIndex === SLIDES.length - 1 ? (
          <View style={styles.finishActions}>
            <ScaleButton
              style={styles.button}
              disableScale={reduceMotion}
              onPress={() => handleFinish()}
              accessibilityHint="Completes onboarding and opens the app"
            >
              <View style={styles.finishBtn}>
                <Text style={styles.buttonText} allowFontScaling>
                  Get Started
                </Text>
              </View>
            </ScaleButton>

            <ScaleButton
              style={[styles.button, styles.secondaryButton]}
              disableScale={reduceMotion}
              onPress={() => handleFinish({ openReadingSettings: true })}
              accessibilityHint="Completes onboarding and opens Reading Settings"
            >
              <View style={styles.secondaryBtnContent}>
                <Text style={styles.secondaryButtonText} allowFontScaling>
                  Fine-tune Settings Now
                </Text>
              </View>
            </ScaleButton>
          </View>
        ) : (
          <View style={styles.progressActions}>
            <ScaleButton
              style={styles.button}
              disableScale={reduceMotion}
              onPress={() => {
                const nextIndex = Math.min(currentIndex + 1, SLIDES.length - 1);
                setCurrentIndex(nextIndex);
                listRef.current?.scrollToIndex({ index: nextIndex, animated: !reduceMotion });
              }}
              accessibilityHint="Moves to the next slide"
            >
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text style={styles.swipeText} allowFontScaling>
                  Next
                </Text>
              </View>
            </ScaleButton>

            <ScaleButton
              style={[styles.button, styles.skipButton]}
              disableScale={reduceMotion}
              onPress={() => handleFinish()}
              accessibilityHint="Skips onboarding and opens the app"
            >
              <View style={styles.skipBtnContent}>
                <Text style={styles.skipButtonText} allowFontScaling>
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

const createStyles = (colors: Colors, fontScale: number) => {
  const scale = (size: number) => size * Math.min(fontScale || 1, 1.6);
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    slide: {
      flex: 1,
    },
    slideContent: {
      flex: 1,
      width: "100%",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: "center",
      justifyContent: "flex-start",
      gap: spacing.sm,
    },
    slideScrollContent: {
      flexGrow: 1,
      justifyContent: "flex-start",
      gap: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl,
    },
    slideContentCompact: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
      alignItems: "center",
    },
    textContainer: {
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    title: {
      fontFamily: typography.fontFamily.serif,
      fontSize: scale(24),
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    titleMedium: {
      fontSize: scale(28),
    },
    titleCompact: {
      fontSize: scale(23),
      marginBottom: spacing.xs,
    },
    description: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(15),
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: scale(20),
      paddingHorizontal: spacing.sm,
    },
    descriptionMedium: {
      fontSize: scale(16),
      paddingHorizontal: spacing.sm,
    },
    descriptionCompact: {
      fontSize: scale(13),
      lineHeight: scale(18),
      paddingHorizontal: spacing.xs,
    },
    demoContainer: {
      width: "100%",
      flexShrink: 1,
      marginTop: spacing.sm,
    },
    groundingPreviewWrapper: {
      width: "100%",
      marginTop: spacing.xs,
      gap: spacing.xs,
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
      flexShrink: 1,
    },
    groundingCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    groundingCardLabel: {
      fontFamily: typography.fontFamily.serif,
      fontSize: scale(19),
      color: colors.text,
    },
    groundingCardMeta: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(13),
      color: colors.textSecondary,
    },
    groundingCardBody: {
      flexDirection: "row",
      gap: spacing.lg,
      alignItems: "center",
      justifyContent: "space-between",
    },
    groundingCardBodySimple: {
      flexDirection: "row",
      gap: spacing.sm,
      alignItems: "center",
    },
    groundingCardCompact: {
      padding: spacing.sm,
      gap: spacing.xs,
    },
    groundingPulse: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.tintTransparent,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${colors.tint}40`,
    },
    groundingPulseText: {
      fontFamily: typography.fontFamily.serif,
      fontSize: scale(20),
      color: colors.text,
    },
    groundingPulseSubtext: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(11),
      textTransform: "uppercase",
      letterSpacing: 1,
      color: colors.textSecondary,
    },
    groundingTiming: {
      flex: 1,
      gap: spacing.xs,
    },
    groundingTimingText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(15),
      color: colors.text,
    },
    groundingPointList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    groundingPointPill: {
      borderRadius: 999,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.background,
    },
    groundingPointText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(13),
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
      fontSize: scale(12),
      fontWeight: "600",
      color: colors.text,
    },
    groundingStyleDescriptionPreview: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(11),
      color: colors.textSecondary,
      lineHeight: scale(15),
      textAlign: "left",
    },
    groundingDetails: {
      flex: 1,
      gap: spacing.xs,
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: spacing.sm,
      paddingLeft: spacing.md,
    },
    groundingDetailsCompact: {
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingLeft: spacing.sm,
    },
    breathRow: {
      flexDirection: "row",
      width: "82%",
      maxWidth: "90%",
      alignSelf: "center",
      paddingHorizontal: 0,
      marginVertical: spacing.xs,
      borderRadius: 999,
      overflow: "hidden",
      height: 10,
    },
    breathSegment: {
      justifyContent: "center",
      alignItems: "center",
    },
    breathSegmentLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(8),
      color: colors.surface,
      fontWeight: "600",
    },
    breathTiming: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(11),
      color: colors.textSecondary,
    },
    groundingSelectorContainer: {
      marginTop: spacing.xs,
      gap: spacing.xs,
    },
    groundingSelectorTitle: {
      fontFamily: typography.fontFamily.serif,
      fontSize: scale(17),
      color: colors.text,
      textAlign: "center",
    },
    groundingSelectorList: {
      gap: spacing.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    groundingSelectorListCompact: {
      gap: spacing.md,
      paddingVertical: spacing.sm,
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
    groundingStyleCardCompact: {
      minHeight: 82,
      paddingVertical: spacing.sm,
    },
    groundingStyleCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "08",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    groundingSelectorHint: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(12),
      color: colors.textSecondary,
      textAlign: "center",
    },
    miniPreviewRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    miniPreviewBtn: {
      borderRadius: 999,
    },
    miniPreviewPill: {
      borderRadius: 999,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    miniPreviewPillActive: {
      backgroundColor: colors.primary + "11",
      borderColor: colors.primary,
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
    miniPreviewLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(11),
      color: colors.text,
    },
    miniPreviewLabelActive: {
      color: colors.primary,
      fontWeight: "600",
    },
    groundingStyleLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(15),
      color: colors.text,
      fontWeight: "600",
    },
    groundingStyleDescription: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(12),
      color: colors.textSecondary,
      lineHeight: scale(18),
    },
    placeholder: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
    },
    layoutSelectorContainer: {
      width: "100%",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    layoutSelectorTitle: {
      fontFamily: typography.fontFamily.serif,
      fontSize: scale(20),
      color: colors.text,
      textAlign: "center",
    },
    layoutSelectorSubtitle: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(14),
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    layoutGrid: {
      gap: spacing.sm,
      width: "100%",
    },
    layoutCard: {
      width: "100%",
    },
    layoutCardBody: {
      width: "100%",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.xs,
    },
    layoutCardBodyCompact: {
      padding: spacing.sm,
      gap: spacing.xs,
    },
    layoutCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.xs,
    },
    layoutTitle: {
      fontFamily: typography.fontFamily.serif,
      fontSize: scale(18),
      color: colors.text,
    },
    layoutTitleCompact: {
      fontSize: scale(17),
    },
    layoutBadge: {
      borderRadius: 999,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 1.5,
      borderWidth: 1,
      backgroundColor: colors.surface,
    },
    layoutBadgeText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(11),
      fontWeight: "700",
    },
    layoutDescription: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(14),
      color: colors.textSecondary,
      lineHeight: scale(20),
    },
    layoutDescriptionCompact: {
      fontSize: scale(12),
      lineHeight: scale(18),
    },
    layoutTabRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    layoutTabRowCompact: {
      gap: spacing.xs,
    },
    layoutTabPill: {
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
    },
    layoutTabText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(12),
      color: colors.text,
      fontWeight: "600",
    },
    footer: {
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      alignItems: "center",
    },
    footerCompact: {
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.lg,
      alignItems: "center",
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.primary,
      width: 24,
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
      marginTop: spacing.xs,
    },
    finishBtn: {
      backgroundColor: colors.text,
      paddingVertical: spacing.md * Math.min(fontScale || 1, 1.2),
      paddingHorizontal: spacing.lg,
      borderRadius: 12,
      alignItems: "center",
    },
    buttonText: {
      color: colors.surface,
      fontSize: scale(18),
      fontWeight: "600",
    },
    secondaryButton: {
      borderRadius: 12,
    },
    secondaryBtnContent: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: spacing.sm * Math.min(fontScale || 1, 1.2),
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      backgroundColor: colors.surface,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: scale(16),
      fontFamily: typography.fontFamily.sans,
      fontWeight: "600",
    },
    swipeText: {
      color: colors.textSecondary,
      marginBottom: 20,
      fontSize: scale(15),
    },
    skipButton: {
      borderRadius: 12,
    },
    skipBtnContent: {
      borderRadius: 12,
      paddingVertical: spacing.sm * Math.min(fontScale || 1, 1.2),
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      backgroundColor: colors.surface,
    },
    skipButtonText: {
      color: colors.textSecondary,
      fontSize: scale(15),
      fontFamily: typography.fontFamily.sans,
      fontWeight: "600",
    },
    srOnly: {
      position: "absolute",
      height: 0,
      width: 0,
      opacity: 0,
    },
    comfortContainer: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    comfortHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    comfortTitle: {
      fontFamily: typography.fontFamily.serif,
      fontSize: scale(18),
      color: colors.text,
    },
    comfortBody: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(14),
      color: colors.textSecondary,
      lineHeight: scale(20),
    },
  });
};
