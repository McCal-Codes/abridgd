import React, { useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Bookmark, BookmarkCheck } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Article } from "../types/Article";
import { fontScaleLimit, typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { ArticleProgressIndicator } from "./ArticleProgressIndicator";
import { Skeleton } from "./Skeleton";
import { ThemeColors } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

import { ScaleButton } from "./ScaleButton";
import Animated, {
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSavedArticlesOptional } from "../context/SavedArticlesContext";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeOptional } from "../theme/ThemeContext";

/** Drag distance at which the swipe commits. Short enough to feel light, long enough that a
 * horizontal nudge while scrolling a list doesn't save an article by accident. */
const SWIPE_THRESHOLD = 88;
/** How far the card can travel, so the action panel stays legible instead of sliding off. */
const SWIPE_LIMIT = 120;

export const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article, onPress }) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useThemeOptional();
  const { saveArticle, unsaveArticle, isArticleSaved } = useSavedArticlesOptional();
  const reduceMotion = useReduceMotion();
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const saved = isArticleSaved(article.id);
  const translateX = useSharedValue(0);

  // Saved's empty state has always told readers to "swipe left on any article card to save it
  // for later". Until now there was no gesture on the card at all.
  const toggleSaved = React.useCallback(() => {
    if (saved) {
      unsaveArticle(article.id);
    } else {
      saveArticle(article);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [article, saved, saveArticle, unsaveArticle]);

  // Runs on the UI thread from the pan's onEnd, so it must be a worklet: calling a plain
  // component-scope function from inside a gesture callback throws at runtime.
  const settle = React.useCallback(() => {
    "worklet";
    return reduceMotion
      ? withTiming(0, { duration: 0 })
      : withSpring(0, { damping: 18, stiffness: 220 });
  }, [reduceMotion]);

  const swipe = React.useMemo(
    () =>
      Gesture.Pan()
        // Only claim the gesture once it is clearly horizontal, so vertical list scrolling wins.
        .activeOffsetX([-14, 14])
        .failOffsetY([-12, 12])
        .onUpdate((event) => {
          translateX.value = Math.max(-SWIPE_LIMIT, Math.min(0, event.translationX));
        })
        .onEnd(() => {
          if (translateX.value <= -SWIPE_THRESHOLD) {
            runOnJS(toggleSaved)();
          }
          translateX.value = settle();
        }),
    [settle, toggleSaved, translateX],
  );

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  // The action panel builds as the card moves, so the gesture explains itself mid-swipe rather
  // than firing invisibly at the end.
  const actionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 1], "clamp"),
    transform: [{ scale: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0.7, 1], "clamp") }],
  }));

  // Read as one item, not as six fragments. VoiceOver was walking the headline, summary,
  // source, separator dots and timestamp separately, none of which announced as a control.
  const accessibilityLabel = [
    article.headline,
    article.source,
    article.timestamp,
    article.author ? `By ${article.author}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const SavedIcon = saved ? BookmarkCheck : Bookmark;

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
      <View style={styles.swipeContainer}>
        <View style={styles.swipeAction}>
          <Animated.View style={actionStyle}>
            <SavedIcon size={22} color={colors.tint} strokeWidth={2} />
            <Text style={styles.swipeActionText} maxFontSizeMultiplier={fontScaleLimit.meta}>
              {saved ? "Unsave" : "Save"}
            </Text>
          </Animated.View>
        </View>

        <GestureDetector gesture={swipe}>
          <Animated.View style={cardStyle}>
      <ScaleButton
        style={styles.card}
        onPress={() => onPress(article)}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Opens the full story"
      >
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.headline}>{article.headline}</Text>
            <Text style={styles.summary} numberOfLines={2}>
              {article.summary}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={styles.metaText} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {article.source}
              </Text>
              <Text style={styles.metaText} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {" • "}
              </Text>
              <Text style={styles.metaText} maxFontSizeMultiplier={fontScaleLimit.meta}>
                {article.timestamp}
              </Text>
              {article.author ? (
                <>
                  <Text style={styles.metaText}> • </Text>
                  <Text
                    style={styles.metaText}
                    numberOfLines={1}
                    maxFontSizeMultiplier={fontScaleLimit.meta}
                  >
                    By {article.author}
                  </Text>
                </>
              ) : null}
            </View>
            {/* Progress indicator - only shows if article has been read */}
            <View style={styles.progressContainer}>
              <ArticleProgressIndicator articleId={article.id} size="small" />
            </View>
          </View>
          {article.imageUrl && !thumbnailFailed && (
            <Image
              testID="article-thumbnail"
              source={{ uri: article.imageUrl }}
              style={styles.thumbnail}
              onError={() => setThumbnailFailed(true)}
            />
          )}
        </View>
      </ScaleButton>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
});

export const ArticleCardSkeleton: React.FC = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Skeleton width="78%" height={22} borderRadius={6} style={{ marginBottom: spacing.xs }} />
          <Skeleton width="95%" height={16} borderRadius={6} style={{ marginBottom: spacing.xs }} />
          <Skeleton width="82%" height={14} borderRadius={6} style={{ marginBottom: spacing.sm }} />
          <Skeleton width={120} height={10} borderRadius={4} />
        </View>
        <Skeleton width={80} height={80} borderRadius={4} />
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    swipeContainer: {
      position: "relative",
    },
    swipeAction: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "flex-end",
      justifyContent: "center",
      paddingRight: spacing.lg,
    },
    swipeActionText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.tint,
      marginTop: 2,
      textAlign: "center",
    },
  card: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  headline: {
    fontFamily: typography.fontFamily.serifBold,
    fontSize: typography.size.lg,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 28, // Hardcoded for consistent rhythm
  },
  summary: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  metaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  });
