import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Article } from "../types/Article";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { ArticleProgressIndicator } from "./ArticleProgressIndicator";
import { Skeleton } from "./Skeleton";

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

import { ScaleButton } from "./ScaleButton";
import Animated, { FadeInDown } from "react-native-reanimated";

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress }) => {
  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
      <ScaleButton style={styles.card} onPress={() => onPress(article)}>
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.headline}>{article.headline}</Text>
            <Text style={styles.summary} numberOfLines={2}>
              {article.summary}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>{article.source}</Text>
              <Text style={styles.metaText}> • </Text>
              <Text style={styles.metaText}>{article.timestamp}</Text>
            </View>
            {/* Progress indicator - only shows if article has been read */}
            <View style={styles.progressContainer}>
              <ArticleProgressIndicator articleId={article.id} size="small" />
            </View>
          </View>
          {article.imageUrl && (
            <Image source={{ uri: article.imageUrl }} style={styles.thumbnail} />
          )}
        </View>
      </ScaleButton>
    </Animated.View>
  );
};

export const ArticleCardSkeleton: React.FC = () => {
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

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.gutter,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
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
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  headline: {
    // Falls back to system font if serif not loaded, handled at App level
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.size.lg,
    fontWeight: "700", // string for weight
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
