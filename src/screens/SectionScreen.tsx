import React from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { useProfilesOptional } from "../context/ProfileContext";
import { ArticleCard, ArticleCardSkeleton } from "../components/ArticleCard";
import { useCategoryFeed } from "../hooks/useCategoryFeed";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { Article, ArticleCategory } from "../types/Article";
import { typography } from "../theme/typography";
import * as Haptics from "expo-haptics";
import { HeroHeader } from "../components/HeroHeader";
import { MapPin, Newspaper } from "lucide-react-native";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SectionRouteProp = RouteProp<TabParamList, "Discover">;

const formatUpdatedAgo = (lastUpdated: Date | null): string | undefined => {
  if (!lastUpdated) return undefined;
  const diffMs = Date.now() - lastUpdated.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSeconds < 60) return "Updated just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Updated ${diffDays}d ago`;
};

const FeedStatusBanner = ({ message }: { message: string }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.statusBanner} testID="section-feed-status">
      <Text style={styles.statusBannerText}>{message}</Text>
    </View>
  );
};

export const SectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SectionRouteProp>();
  const category = route.params?.category as ArticleCategory;
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);

  const { articles, loading, error, refreshing, lastUpdated, refresh } = useCategoryFeed(category);
  const profileContext = useProfilesOptional();
  const recordLastFetchedRef = React.useRef(profileContext?.recordLastFetchedArticles);
  const insets = useSafeAreaInsets();
  const {
    tabBarHeight,
    tabBarBlur,
    allowContentUnderTabBar,
    tabBarStyle,
    tabBarDockedHeight,
    tabBarFloatingHeight,
  } = useSettings();

  React.useEffect(() => {
    recordLastFetchedRef.current = profileContext?.recordLastFetchedArticles;
  }, [profileContext?.recordLastFetchedArticles]);

  const recordedArticleIdsRef = React.useRef<string>("");
  React.useEffect(() => {
    if (articles.length === 0) return;
    const ids = articles.map((article) => article.id);
    const key = ids.join(",");
    if (key === recordedArticleIdsRef.current) return;
    recordedArticleIdsRef.current = key;
    recordLastFetchedRef.current?.(ids);
  }, [articles]);

  const headerIcon = category === "Local" ? MapPin : Newspaper;

  const showSkeleton = articles.length === 0 && (loading || refreshing);
  const showErrorState = !showSkeleton && !!error && articles.length === 0;
  const showEmptyState = !loading && !refreshing && !error && articles.length === 0;

  const renderArticle = React.useCallback(
    ({ item }: { item: Article }) => (
      <ArticleCard
        article={item}
        onPress={(article) => navigation.navigate("Article", { article: article })}
      />
    ),
    [navigation],
  );

  return (
    <View style={styles.container}>
      {showSkeleton ? (
        <FlatList
          data={Array.from({ length: 6 })}
          keyExtractor={(_, idx) => `skeleton-${idx}`}
          renderItem={() => <ArticleCardSkeleton />}
          contentContainerStyle={{ paddingBottom: spacing.xl + insets.bottom }}
        />
      ) : showErrorState ? (
        <View style={[styles.center, { flex: 1 }]}>
          <View style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface }}>
            <Text style={{ color: colors.systemRed, marginBottom: 8 }}>Network error</Text>
            <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>{error}</Text>
            <Text onPress={() => refresh()} style={{ color: colors.tint }}>
              Retry
            </Text>
          </View>
        </View>
      ) : showEmptyState ? (
        <View style={[styles.container, styles.center]}>
          <Text style={styles.emptyText}>No articles in {category}</Text>
        </View>
      ) : (
        <FlatList
          testID="section-list"
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={renderArticle}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: allowContentUnderTabBar
                ? spacing.lg + insets.bottom + 8
                : spacing.lg +
                  (tabBarStyle === "floating"
                    ? tabBarFloatingHeight || 64
                    : tabBarDockedHeight || tabBarHeight) +
                  insets.bottom +
                  16,
            },
          ]}
          ListHeaderComponent={
            <>
              <View style={[styles.headerContainer, { paddingTop: spacing.sm }]}>
                <HeroHeader
                  title={category}
                  subtitle={lastUpdated ? formatUpdatedAgo(lastUpdated) : undefined}
                  subtitleTestID="section-updated"
                  Icon={headerIcon}
                />
              </View>
              {error && articles.length > 0 && (
                <FeedStatusBanner message="Couldn't load fresh stories. Showing the last successful update." />
              )}
            </>
          }
          refreshing={refreshing}
          onRefresh={async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {
              // noop if haptics unavailable
            }
            await refresh();
          }}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
  },
  statusBanner: {
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statusBannerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  emptyText: {
    fontFamily: typography.fontFamily.sans,
    color: colors.textSecondary,
  },
  });
