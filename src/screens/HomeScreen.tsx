import React from "react";
import { View, FlatList, StyleSheet, StatusBar, Animated, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { ScrollContext } from "../context/ScrollContext";
import { ArticleCard, ArticleCardSkeleton } from "../components/ArticleCard";
import { FunLoadingIndicator } from "../components/FunLoadingIndicator";
import {
  fetchArticlesByCategory,
  getLastFetchedAt,
  getCachedArticles,
} from "../services/RssService";
import { useProfilesOptional } from "../context/ProfileContext";
import { Article } from "../types/Article";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { useReadingProgressOptional } from "../context/ReadingProgressContext";
import { useSavedArticles } from "../context/SavedArticlesContext";
import { ArticleProgressIndicator } from "../components/ArticleProgressIndicator";
import { ScaleButton } from "../components/ScaleButton";
import { PillButton } from "../shared/ui/buttons/PillButton";
import { typography } from "../theme/typography";
import { ReadingProgress } from "../types/ReadingProgress";
import * as Haptics from "expo-haptics";
import { HeroHeader } from "../components/HeroHeader";
import { Home as HomeIcon } from "lucide-react-native";
import { useTheme, Colors } from "../theme/ThemeContext";

type ContinueReadingItem = {
  article: Article;
  progress: ReadingProgress;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedFlatList: typeof FlatList =
  (Animated as any)?.FlatList ||
  ((Animated as any)?.createAnimatedComponent
    ? ((Animated as any).createAnimatedComponent(FlatList) as typeof FlatList)
    : FlatList) ||
  FlatList;

const formatUpdatedAgo = (lastUpdated: Date | null) => {
  if (!lastUpdated) return null;
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

const ContinueReadingSection = ({
  items,
  onPress,
  showAll,
  onToggleShowAll,
  lastUpdated,
  styles,
}: {
  items: ContinueReadingItem[];
  onPress: (article: Article) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
  lastUpdated: Date | null;
  styles: ReturnType<typeof createStyles>;
}) => {
  if (!items.length) return null;

  const visibleItems = showAll ? items : items.slice(0, 3);
  const canToggle = items.length > 3;
  return (
    <View style={styles.continueContainer} testID="continue-reading">
      <View style={styles.continueHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.continueTitle}>Continue Reading</Text>
          <Text style={styles.continueSubtitle}>
            {items.length === 1 ? "1 article in progress" : `${items.length} articles in progress`}
          </Text>
        </View>
        {lastUpdated && <Text style={styles.updatedBadge}>{formatUpdatedAgo(lastUpdated)}</Text>}
        {canToggle && (
          <PillButton
            label={showAll ? "Hide" : "Show all"}
            onPress={onToggleShowAll}
            accessibilityLabel={showAll ? "Hide continue reading list" : "Show all in continue reading"}
            hitSlop={12}
            testID="continue-toggle"
          />
        )}
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.article.id}
        renderItem={({ item }) => (
          <ScaleButton style={styles.continueCard} onPress={() => onPress(item.article)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.continueHeadline} numberOfLines={2}>
                {item.article.headline}
              </Text>
              <View style={styles.continueMetaRow}>
                <Text style={styles.continueMeta}>{item.article.source}</Text>
                <Text style={styles.continueMetaDot}>•</Text>
                <Text style={styles.continueMeta}>{item.article.timestamp}</Text>
              </View>
              <View style={styles.continueProgressRow}>
                <ArticleProgressIndicator articleId={item.article.id} size="medium" showLabel />
                <Text style={styles.continuePercent}>{item.progress.completionPercentage}%</Text>
              </View>
            </View>
          </ScaleButton>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
        contentContainerStyle={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.gutter }}
      />
    </View>
  );
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showAllContinue, setShowAllContinue] = React.useState(false);
  const [hadCachedArticles, setHadCachedArticles] = React.useState(false);
  const { inProgressArticles } = useReadingProgressOptional();
  const { savedArticles } = useSavedArticles();
  const profileContext = useProfilesOptional?.();

  const { scrollY } = React.useContext(ScrollContext);
  const insets = useSafeAreaInsets();
  const {
    tabBarHeight,
    tabBarBlur,
    allowContentUnderTabBar,
    tabBarStyle,
    tabBarDockedHeight,
    tabBarFloatingHeight,
    isContinueReadingEnabled,
  } = useSettings();

  // Define onScroll callback unconditionally to preserve hook order between renders
  const onScroll = React.useCallback(
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true }),
    [scrollY],
  );

  React.useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const data = await fetchArticlesByCategory("Top", { forceRefresh: true });
        setArticles(data);
        profileContext?.recordLastFetchedArticles?.(data.map((a) => a.id));
        const fetchedAt = getLastFetchedAt("Top");
        setLastUpdated(fetchedAt ? new Date(fetchedAt) : new Date());
      } catch (e: any) {
        setError(e?.message || "Failed to load articles.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    const cached = getCachedArticles("Top");
    if (cached && cached.length) {
      setHadCachedArticles(true);
      setArticles(cached);
      profileContext?.recordLastFetchedArticles?.(cached.map((a) => a.id));
      const fetchedAt = getLastFetchedAt("Top");
      setLastUpdated(fetchedAt ? new Date(fetchedAt) : null);
      setLoading(false);
      setRefreshing(true);
    }

    load();
  }, []);

  const continueReadingItems = React.useMemo(() => {
    if (!inProgressArticles.length) return [];

    return inProgressArticles
      .map((progress) => {
        const article =
          savedArticles.find((a) => a.id === progress.articleId) ||
          articles.find((a) => a.id === progress.articleId);
        if (!article) return null;
        return { article, progress };
      })
      .filter(Boolean) as { article: Article; progress: any }[];
  }, [inProgressArticles, savedArticles, articles]);

  const handleToggleShowAll = React.useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // best-effort haptic
    }
    setShowAllContinue((prev) => !prev);
  }, []);

  React.useEffect(() => {
    if (continueReadingItems.length <= 3 && showAllContinue) {
      setShowAllContinue(false);
    }
  }, [continueReadingItems.length, showAllContinue]);

  const showSkeleton = loading && articles.length === 0;
  const showErrorState = !showSkeleton && !!error && articles.length === 0;
  const showEmptyState = !loading && !error && articles.length === 0;

  const renderHeroHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top + spacing.sm }]}>
      <HeroHeader
        title="Top Stories"
        subtitle={lastUpdated ? formatUpdatedAgo(lastUpdated) : undefined}
        Icon={HomeIcon}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {showSkeleton ? (
        <View style={styles.flexContent}>
          {renderHeroHeader()}
          {isContinueReadingEnabled && continueReadingItems.length > 0 && (
            <ContinueReadingSection
              items={continueReadingItems}
              onPress={(article) => navigation.navigate("Article", { article })}
              showAll={showAllContinue}
              onToggleShowAll={handleToggleShowAll}
              lastUpdated={lastUpdated}
              styles={styles}
            />
          )}
          <View style={styles.skeletonList}>
            {Array.from({ length: 4 }).map((_, index) => (
              <ArticleCardSkeleton key={`skeleton-${index}`} />
            ))}
          </View>
          <View style={styles.loadingOverlay} pointerEvents="none" testID="article-card-skeleton">
            <FunLoadingIndicator message="Fetching top stories…" />
          </View>
        </View>
      ) : showErrorState ? (
        <View style={styles.flexContent}>
          {renderHeroHeader()}
          {isContinueReadingEnabled && continueReadingItems.length > 0 && (
            <ContinueReadingSection
              items={continueReadingItems}
              onPress={(article) => navigation.navigate("Article", { article })}
              showAll={showAllContinue}
              onToggleShowAll={handleToggleShowAll}
              lastUpdated={lastUpdated}
              styles={styles}
            />
          )}
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle} allowFontScaling accessibilityRole="header">
                Network error
              </Text>
              <Text style={styles.errorBody} allowFontScaling>
                {error}
              </Text>
              {hadCachedArticles ? (
                <Text style={styles.errorHint} allowFontScaling>
                  Showing your last saved feed. Retry when you are back online.
                </Text>
              ) : null}
              <ScaleButton
                style={styles.retryButton}
                accessibilityRole="button"
                accessibilityLabel="Retry loading articles"
                onPress={() => {
                  setLoading(true);
                  setError(null);
                  fetchArticlesByCategory("Top")
                    .then((data) => {
                      setArticles(data);
                      profileContext?.recordLastFetchedArticles?.(data.map((a) => a.id));
                      const fetchedAt = getLastFetchedAt("Top");
                      setLastUpdated(fetchedAt ? new Date(fetchedAt) : new Date());
                      setLoading(false);
                    })
                    .catch((e) => {
                      setError(e?.message || "Failed to load articles.");
                      setLoading(false);
                    });
                }}
              >
                <Text style={styles.retryButtonText} allowFontScaling>
                  Retry
                </Text>
              </ScaleButton>
            </View>
          </View>
        </View>
      ) : showEmptyState ? (
        <View style={styles.flexContent}>
          {renderHeroHeader()}
          {isContinueReadingEnabled && continueReadingItems.length > 0 && (
            <ContinueReadingSection
              items={continueReadingItems}
              onPress={(article) => navigation.navigate("Article", { article })}
              showAll={showAllContinue}
              onToggleShowAll={handleToggleShowAll}
              lastUpdated={lastUpdated}
              styles={styles}
            />
          )}
          <View style={styles.centerContent}>
            <FunLoadingIndicator message="Syncing your feed…" />
          </View>
        </View>
      ) : (
        <AnimatedFlatList
          testID="home-list"
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              onPress={(article) => navigation.navigate("Article", { article: article })}
            />
          )}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={6}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          ListHeaderComponent={() => (
            <>
              {renderHeroHeader()}
              {isContinueReadingEnabled && (
                <ContinueReadingSection
                  items={continueReadingItems}
                  onPress={(article) => navigation.navigate("Article", { article })}
                  showAll={showAllContinue}
                  onToggleShowAll={handleToggleShowAll}
                  lastUpdated={lastUpdated}
                />
              )}
            </>
          )}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: allowContentUnderTabBar
                ? spacing.lg + insets.bottom + spacing.md
                : spacing.lg +
                  (tabBarStyle === "floating"
                    ? tabBarFloatingHeight || 64
                    : tabBarDockedHeight || tabBarHeight) +
                  insets.bottom +
                  spacing.lg,
            },
          ]}
          refreshing={refreshing}
          // wire scroll to the shared scrollY value so tab bar can animate
          onScroll={onScroll}
          scrollEventThrottle={16}
          onRefresh={async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {
              // noop if haptics unavailable
            }
            setRefreshing(true);
            setError(null);
            try {
              const data = await fetchArticlesByCategory("Top", { forceRefresh: true });
              setArticles(data);
              profileContext?.recordLastFetchedArticles?.(data.map((a) => a.id));
              const fetchedAt = getLastFetchedAt("Top");
              setLastUpdated(fetchedAt ? new Date(fetchedAt) : new Date());
            } catch (e: any) {
              setError(e?.message || "Failed to refresh.");
            } finally {
              setRefreshing(false);
            }
          }}
        />
      )}
    </View>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flexContent: {
      flex: 1,
      position: "relative",
    },
    listContent: {
      paddingBottom: spacing.lg,
    },
    skeletonList: {
      paddingTop: spacing.sm,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.gutter,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.gutter,
    },
    continueContainer: {
      paddingTop: spacing.gutter,
      paddingBottom: spacing.sm,
      backgroundColor: colors.background,
    },
    continueHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.gutter,
    },
    continueTitle: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.lg,
      fontWeight: "700",
      color: colors.text,
    },
    continueSubtitle: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
    },
    updatedBadge: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      marginRight: spacing.sm,
    },
    continueCard: {
      width: 260,
      padding: spacing.md,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    continueHeadline: {
      fontFamily: typography.fontFamily.serif,
      fontSize: typography.size.md,
      fontWeight: "700",
      color: colors.text,
    },
    continueMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.xs,
    },
    continueMeta: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    continueMetaDot: {
      marginHorizontal: 6,
      color: colors.textSecondary,
    },
    continueProgressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    continuePercent: {
      fontFamily: typography.fontFamily.mono,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
    },
    headerContainer: {
      backgroundColor: colors.background,
      paddingBottom: spacing.xs,
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.gutter,
    },
    errorCard: {
      width: "100%",
      maxWidth: 480,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      gap: spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    errorTitle: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.lg,
      fontWeight: "700",
      color: colors.systemRed,
    },
    errorBody: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.md,
      color: colors.text,
    },
    errorHint: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
    },
    retryButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
    },
    retryButtonText: {
      color: colors.surface,
      fontFamily: typography.fontFamily.sans,
      fontWeight: "700",
      fontSize: typography.size.md,
    },
  });
