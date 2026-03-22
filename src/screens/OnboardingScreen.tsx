import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { ScaleButton } from "../components/ScaleButton";
import { useSettings } from "../context/SettingsContext";
import { RootStackParamList } from "../navigation/types";

import { AbridgedReader } from "../components/AbridgedReader";
import { BookOpen, PauseCircle, Wind, Sliders, CheckCircle } from "lucide-react-native";
import { GroundingAnimationStyle } from "../context/SettingsContext";
import { useThemedStyles } from "../theme/useThemedStyles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
    id: "ready",
    title: "Welcome Home",
    description:
      "No accounts, no tracking, no noise. Just the news, on your terms. We're glad you found us.",
    demo: false,
    Icon: CheckCircle,
  },
];

const GROUNDING_POINTS = ["Optional before tough reads", "≈30s steady loop"];

const BREATH_SEGMENTS = [
  { label: "In", flex: 4, color: "#3FA2A7" },
  { label: "Hold", flex: 1, color: "#7FC6C9" },
  { label: "Out", flex: 6, color: "#A3D8DA" },
];

const GROUNDING_STYLES: { id: GroundingAnimationStyle; label: string; description: string }[] = [
  { id: "simple", label: "Calm Loop", description: "Soft inhale / exhale — classic." },
  { id: "waves", label: "Wave Drift", description: "Slow gradients, like tide coming in." },
  { id: "pulse", label: "Focus Pulse", description: "Minimal ring, steady and quiet." },
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
  const metaSize = isCompactHeight ? 13 : 14;
  const selectedStyle = GROUNDING_STYLES.find((s) => s.id === currentStyle) || GROUNDING_STYLES[0];

  return (
    <View style={[styles.groundingCard, { padding: cardPadding }]}>
      <View style={styles.groundingCardHeader}>
        <Text style={[styles.groundingCardLabel, { fontSize: labelSize }]}>Grounding Mode</Text>
        <View style={styles.groundingStyleBadge}>
          <Text style={styles.groundingStyleBadgeText}>{selectedStyle.label}</Text>
        </View>
      </View>
      <View style={styles.groundingCardBodySimple}>
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
            {BREATH_SEGMENTS.map((seg) => (
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
            <ScaleButton onPress={() => onChange(item.id)} style={{ width: cardWidth }}>
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
        You can change this later in Settings → Reading.
      </Text>
    </View>
  );
};
export const OnboardingScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { completeOnboarding, groundingAnimationStyle, setGroundingAnimationStyle } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompactHeight = screenHeight < 720;
  const isMediumHeight = screenHeight >= 720 && screenHeight < 820;
  const demoHeight = isCompactHeight ? 170 : isMediumHeight ? 240 : 320;
  const [selectedGroundingStyle, setSelectedGroundingStyle] =
    useState<GroundingAnimationStyle>(groundingAnimationStyle);

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
        <View
          style={[
            styles.slideContent,
            (isCompactHeight || isMediumHeight) && styles.slideContentCompact,
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

          {/* Live Demos */}
          {item.demo && item.demoText && (
            <View style={[styles.demoContainer, { minHeight: demoHeight }]}>
              <AbridgedReader content={item.demoText} />
            </View>
          )}

          {/* Grounding Preview */}
          {item.grounding && (
            <View style={styles.groundingPreviewWrapper}>
              <GroundingPreviewCard
                isCompactHeight={isCompactHeight}
                currentStyle={selectedGroundingStyle}
              />
              <GroundingStyleSelector
                value={selectedGroundingStyle}
                onChange={(style) => setSelectedGroundingStyle(style)}
                isCompactHeight={isCompactHeight}
              />
            </View>
          )}

          {/* Static Icon Placeholder */}
          {!item.demo && !item.grounding && (
            <View style={styles.placeholder}>
              {item.Icon && <item.Icon size={72} color={colors.text} strokeWidth={1.5} />}
            </View>
          )}
        </View>
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
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={[styles.footer, isCompactHeight && styles.footerCompact]}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View key={index} style={[styles.dot, currentIndex === index && styles.dotActive]} />
          ))}
        </View>

        {currentIndex === SLIDES.length - 1 ? (
          <View style={styles.finishActions}>
            <ScaleButton style={styles.button} onPress={() => handleFinish()}>
              <View style={styles.finishBtn}>
                <Text style={styles.buttonText}>Get Started</Text>
              </View>
            </ScaleButton>

            <ScaleButton
              style={[styles.button, styles.secondaryButton]}
              onPress={() => handleFinish({ openReadingSettings: true })}
            >
              <View style={styles.secondaryBtnContent}>
                <Text style={styles.secondaryButtonText}>Fine-tune Settings Now</Text>
              </View>
            </ScaleButton>
          </View>
        ) : (
          <View style={styles.progressActions}>
            <ScaleButton
              style={styles.button}
              onPress={() => {
                // Encourage swipe interaction; no-op button keeps layout consistent
              }}
            >
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text style={styles.swipeText}>Swipe to continue</Text>
              </View>
            </ScaleButton>

            <ScaleButton style={[styles.button, styles.skipButton]} onPress={() => handleFinish()}>
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
  slideContent: {
    flex: 1,
    width: "100%",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.sm,
  },
  slideContentCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    alignItems: "center",
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
    marginBottom: spacing.xs,
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
    paddingHorizontal: spacing.md,
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
  groundingCardMeta: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
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
  groundingTiming: {
    flex: 1,
    gap: spacing.xs,
  },
  groundingTimingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
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
    fontSize: 13,
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
    fontSize: 8,
    color: colors.surface,
    fontWeight: "600",
  },
  breathTiming: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  groundingSelectorContainer: {
    marginTop: spacing.xs,
    gap: spacing.xs,
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
    backgroundColor: colors.primary + "08",
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
  miniPreviewRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
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
  miniPreviewLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.text,
  },
  miniPreviewLabelActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  placeholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
    alignItems: "center",
  },
  footerCompact: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
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
  swipeText: {
    color: colors.textSecondary,
    marginBottom: 20,
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
  });
