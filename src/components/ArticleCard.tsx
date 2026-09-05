import React, { useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Article } from "../types/Article";
import { typography } from "../theme/typography";
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
import Animated, { FadeInDown } from "react-native-reanimated";

/** The meta row is a single line of small text under the summary. Headline and summary scale
 * with Dynamic Type without limit; this row is capped so it wraps gracefully instead of
 * pushing the thumbnail off the card at the largest accessibility sizes. */
const META_TEXT_SCALE = 1.4;

export const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article, onPress }) => {
  const styles = useThemedStyles(createStyles);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

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

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
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
              <Text style={styles.metaText} maxFontSizeMultiplier={META_TEXT_SCALE}>
                {article.source}
              </Text>
              <Text style={styles.metaText} maxFontSizeMultiplier={META_TEXT_SCALE}>
                {" • "}
              </Text>
              <Text style={styles.metaText} maxFontSizeMultiplier={META_TEXT_SCALE}>
                {article.timestamp}
              </Text>
              {article.author ? (
                <>
                  <Text style={styles.metaText}> • </Text>
                  <Text
                    style={styles.metaText}
                    numberOfLines={1}
                    maxFontSizeMultiplier={META_TEXT_SCALE}
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
