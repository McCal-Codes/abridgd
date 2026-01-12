import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Article } from '../types/Article';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

import { ScaleButton } from './ScaleButton';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress }) => {
  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
        <ScaleButton style={styles.card} onPress={() => onPress(article)}>
        <Text style={styles.headline}>{article.headline}</Text>
        <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>
        <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{article.source}</Text>
            <Text style={styles.metaText}> • </Text>
            <Text style={styles.metaText}>{article.timestamp}</Text>
        </View>
        </ScaleButton>
    </Animated.View>
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
  headline: {
    // Falls back to system font if serif not loaded, handled at App level
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.size.lg,
    fontWeight: '700', // string for weight
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
});
