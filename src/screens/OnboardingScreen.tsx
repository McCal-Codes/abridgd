import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, useWindowDimensions, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { ScaleButton } from "../components/ScaleButton";
import { useSettings } from "../context/SettingsContext";
import { RootStackParamList } from "../navigation/types";

import { AbridgedReader } from "../components/AbridgedReader";
import { BookOpen, PauseCircle, Wind, Sliders, CheckCircle } from "lucide-react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SLIDES = [
  {
    id: "1",
    title: "Finally, a Good News App",
    description:
      "We know the struggle. You downloaded this because you could not find a news app that felt right. You are in luck, you found it.",
    demo: false,
    Icon: BookOpen,
  },
  {
    id: "2",
    title: "Give Your Eyes a Break",
    description:
      "Doomscrolling is exhausting. Our RSVP reader shows you one word at a time, locked in place. It is surprisingly calm, like a massage for your brain.",
    demo: true,
    demoText:
      "We hope you find this reading experience to be incredibly peaceful and kind to your eyes, and if you are ever feeling hungry, remember that almost everything is better as chicken on a stick.",
    Icon: PauseCircle,
  },
  {
    id: "practice",
    title: "Practice RSVP Reading",
    description:
      "Start slow (200–250 WPM), then nudge up as it feels comfortable. Keep your eyes near the pivot letter (highlighted) and let the words come to you.",
    demo: true,
    demoText:
      "Practice makes calm: begin at a gentle pace, notice the highlighted focal point, and increase speed when your eyes feel ready.",
    Icon: PauseCircle,
  },
  {
    id: "grounding",
    title: "Breathe",
    description:
      "News can be heavy. When sensitive topics appear, Grounding Mode offers a gentle breathing reset — and you can customize its feel later in Settings.",
    demo: false,
    grounding: true,
    Icon: Wind,
  },
  {
    id: "grounding-options",
    title: "Pick Your Grounding Style",
    description:
      "Prefer calm loops, flowing waves, or a minimal pulse? Once you're inside the app, head to Settings → Reading to choose the look that suits you.",
    demo: false,
    groundingOptions: true,
    Icon: Wind,
  },
  {
    id: "3",
    title: "Make It Yours",
    description:
      "We don't do 'one size fits all.' Change the colors, adjust the speed, or tweak the focus point. This is your quiet corner of the internet.",
    demo: false,
    Icon: Sliders,
  },
  {
    id: "4",
    title: "Welcome Home",
    description:
      "No accounts, no tracking, no noise. Just the news, on your terms. We're glad you found us.",
    demo: false,
    Icon: CheckCircle,
  },
];

const GROUNDING_POINTS = [
  "Steady, rounded motion",
  "Optional before tough reads",
  "30-second default loop",
];

const GROUNDING_PRESENTATIONS = [
  { id: "simple", label: "Calm Loop", description: "Classic inhale / exhale" },
  { id: "waves", label: "Wave Drift", description: "Flowing gradients" },
  { id: "pulse", label: "Focus Pulse", description: "Minimal ring" },
];

const GroundingPreviewCard: React.FC = () => {
  return (
    <View style={styles.groundingCard}>
      <View style={styles.groundingCardHeader}>
        <Text style={styles.groundingCardLabel}>Grounding Mode</Text>
        <Text style={styles.groundingCardMeta}>Steady • ≈30s</Text>
      </View>
      <View style={styles.groundingCardBody}>
        <View style={styles.groundingPulse}>
          <Text style={styles.groundingPulseText}>Inhale</Text>
          <Text style={styles.groundingPulseSubtext}>softly</Text>
        </View>
        <View style={styles.groundingTiming}>
          <Text style={styles.groundingTimingText}>4s inhale</Text>
          <Text style={styles.groundingTimingText}>1s stillness</Text>
          <Text style={styles.groundingTimingText}>6s exhale</Text>
        </View>
      </View>
      <View style={styles.groundingPointList}>
        {GROUNDING_POINTS.map((point) => (
          <View key={point} style={styles.groundingPointPill}>
            <Text style={styles.groundingPointText}>{point}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.groundingFootnote}>Appears before heavy articles. Always optional.</Text>
      <Text style={styles.groundingSettingsNote}>
        Fine-tune timing and visuals later in Settings → Reading.
      </Text>
    </View>
  );
};

const GroundingOptionsPreview: React.FC = () => {
  return (
    <View style={styles.groundingOptionsContainer}>
      <Text style={styles.groundingOptionsHeading}>Presentation preview</Text>
      {GROUNDING_PRESENTATIONS.map((option, index) => (
        <View
          key={option.id}
          style={[
            styles.groundingOptionsRow,
            index === GROUNDING_PRESENTATIONS.length - 1 && styles.groundingOptionsRowLast,
          ]}
        >
          <View>
            <Text style={styles.groundingOptionsLabel}>{option.label}</Text>
            <Text style={styles.groundingOptionsDescription}>{option.description}</Text>
          </View>
        </View>
      ))}
      <Text style={styles.groundingOptionsNote}>
        Change styles anytime via Settings → Reading → Grounding.
      </Text>
    </View>
  );
};
export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { completeOnboarding } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompactHeight = screenHeight < 720;
  const isMediumHeight = screenHeight >= 720 && screenHeight < 820;
  const demoHeight = isCompactHeight ? 240 : isMediumHeight ? 300 : 350;

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
          style={styles.slideScroll}
          contentContainerStyle={[
            styles.slideContent,
            (isCompactHeight || isMediumHeight) && styles.slideContentCompact,
          ]}
          showsVerticalScrollIndicator={false}
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
              <GroundingPreviewCard />
            </View>
          )}

          {item.groundingOptions && (
            <View style={styles.groundingPreviewWrapper}>
              <GroundingOptionsPreview />
            </View>
          )}

          {/* Static Icon Placeholder */}
          {!item.demo && !item.grounding && (
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
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
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
                <Text style={styles.secondaryButtonText}>Fine-tune Grounding Now</Text>
              </View>
            </ScaleButton>
          </View>
        ) : (
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
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    flex: 1,
  },
  slideScroll: {
    flex: 1,
  },
  slideContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  slideContentCompact: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  textContainer: {
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  title: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  titleMedium: {
    fontSize: 30,
  },
  titleCompact: {
    fontSize: 26,
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  descriptionMedium: {
    fontSize: 17,
    paddingHorizontal: spacing.md,
  },
  descriptionCompact: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  demoContainer: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  groundingPreviewWrapper: {
    width: "100%",
    marginTop: spacing.lg,
  },
  groundingCard: {
    width: "100%",
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  groundingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groundingCardLabel: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 20,
    color: colors.text,
  },
  groundingCardMeta: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  groundingCardBody: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "center",
    justifyContent: "space-between",
  },
  groundingPulse: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E6F4F4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C8E1E0",
  },
  groundingPulseText: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 24,
    color: colors.text,
  },
  groundingPulseSubtext: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  groundingPointText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  groundingFootnote: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  groundingSettingsNote: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  groundingOptionsContainer: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  groundingOptionsHeading: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  groundingOptionsRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  groundingOptionsRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  groundingOptionsLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  groundingOptionsDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  groundingOptionsNote: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  placeholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    padding: spacing.xl,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.xl,
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
  },
  finishActions: {
    width: "100%",
    gap: spacing.md,
  },
  finishBtn: {
    backgroundColor: colors.text,
    paddingVertical: spacing.lg,
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
    paddingVertical: spacing.md,
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
});
