import React from "react";
import { View, FlatList, ScrollView, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { useProfilesOptional } from "../context/ProfileContext";
import { ArticleCard, ArticleCardSkeleton } from "../components/ArticleCard";
import { useCategoryFeed } from "../hooks/useCategoryFeed";
import { getAllCategories } from "../services/feed/sourceRegistry";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { Article, ArticleCategory } from "../types/Article";
import { typography } from "../theme/typography";
import * as Haptics from "expo-haptics";
import { HeroHeader } from "../components/HeroHeader";
import { FeedStatusBanner } from "../components/FeedStatusBanner";
import { MapPin, Newspaper } from "lucide-react-native";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { formatUpdatedAgo } from "../utils/relativeTime";
import { announceRefreshResult } from "../utils/announce";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SectionRouteProp = RouteProp<TabParamList, "Discover">;

/** Horizontal picker across every configured category. Until this existed, Business, Sports
 * and Culture were fetched for the digest but had no browsable entry point anywhere in the app. */
const CategoryPicker = ({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: ArticleCategory[];
  activeCategory: ArticleCategory;
  onSelect: (category: ArticleCategory) => void;
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pickerContent}
      testID="section-category-picker"
    >
      {categories.map((category) => {
        const selected = category === activeCategory;
        return (
          <Pressable
            key={category}
            testID={`section-category-${category}`}
            onPress={() => onSelect(category)}
            accessibilityRole="button"
            accessibilityLabel={`${category} section`}
            accessibilityState={{ selected }}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text
              style={[styles.chipLabel, selected && styles.chipLabelSelected]}
              maxFontSizeMultiplier={1.4}
            >
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export const SectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SectionRouteProp>();
  const routeCategory = route.params?.category as ArticleCategory | undefined;
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);

  const categories = React.useMemo(() => getAllCategories(), []);
  const [category, setCategory] = React.useState<ArticleCategory>(
    routeCategory ?? categories[0] ?? "Local",
  );

  // A tab press can re-deliver the route's own category param; follow it so deep links and
  // tab config stay authoritative, while in-screen selection drives everything else.
  React.useEffect(() => {
    if (routeCategory) setCategory(routeCategory);
  }, [routeCategory]);

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

  const handleSelectCategory = React.useCallback(
    async (next: ArticleCategory) => {
      if (next === category) return;
      setCategory(next);
      try {
        await Haptics.selectionAsync();
      } catch {
        // noop if haptics unavailable
      }
    },
    [category],
  );

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

  // Rendered in every branch, not just the populated list: an empty or failing category still
  // needs a way out to a different one.
  const renderHeader = () => (
    <>
      <View style={[styles.headerContainer, { paddingTop: insets.top + spacing.sm }]}>
        <HeroHeader
          title={category}
          subtitle={lastUpdated ? formatUpdatedAgo(lastUpdated) : undefined}
          subtitleTestID="section-updated"
          Icon={headerIcon}
        />
      </View>
      <CategoryPicker
        categories={categories}
        activeCategory={category}
        onSelect={handleSelectCategory}
      />
    </>
  );

  const listPaddingBottom = allowContentUnderTabBar
    ? spacing.lg + insets.bottom + 8
    : spacing.lg +
      (tabBarStyle === "floating"
        ? tabBarFloatingHeight || 64
        : tabBarDockedHeight || tabBarHeight) +
      insets.bottom +
      16;

  return (
    <View style={styles.container}>
      {showSkeleton ? (
        <FlatList
          data={Array.from({ length: 6 })}
          keyExtractor={(_, idx) => `skeleton-${idx}`}
          renderItem={() => <ArticleCardSkeleton />}
          ListHeaderComponent={renderHeader()}
          contentContainerStyle={{ paddingBottom: spacing.xl + insets.bottom }}
        />
      ) : showErrorState ? (
        <ScrollView contentContainerStyle={{ paddingBottom: listPaddingBottom }}>
          {renderHeader()}
          <View style={styles.center}>
            <View style={[styles.errorCard, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.systemRed, marginBottom: 8 }}>Network error</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>{error}</Text>
              <Text
                onPress={() => refresh()}
                accessibilityRole="button"
                style={{ color: colors.tint }}
              >
                Retry
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : showEmptyState ? (
        <ScrollView contentContainerStyle={{ paddingBottom: listPaddingBottom }}>
          {renderHeader()}
          <View style={styles.center}>
            <Text style={styles.emptyText}>No articles in {category}</Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          testID="section-list"
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={9}
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={renderArticle}
          contentContainerStyle={[styles.listContent, { paddingBottom: listPaddingBottom }]}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {error && articles.length > 0 && (
                <FeedStatusBanner
                  testID="section-feed-status"
                  message="Couldn't load fresh stories. Showing the last successful update."
                />
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
            const outcome = await refresh();
            announceRefreshResult(outcome.count, outcome.failed);
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
    pickerContent: {
      paddingHorizontal: spacing.gutter,
      paddingBottom: spacing.sm,
      gap: spacing.xs,
    },
    chip: {
      minHeight: 32,
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipSelected: {
      backgroundColor: colors.tint,
      borderColor: colors.tint,
    },
    chipLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
    },
    chipLabelSelected: {
      color: colors.background,
      fontWeight: "600",
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    errorCard: {
      padding: 16,
      borderRadius: 12,
      marginHorizontal: spacing.gutter,
    },
    listContent: {
      paddingBottom: spacing.lg,
    },
    emptyText: {
      fontFamily: typography.fontFamily.sans,
      color: colors.textSecondary,
    },
  });
