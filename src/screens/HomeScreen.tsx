import React from "react";
import { View, FlatList, StyleSheet, StatusBar, Animated, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { useProfilesOptional } from "../context/ProfileContext";
import { ScrollContext } from "../context/ScrollContext";
import { ArticleCard } from "../components/ArticleCard";
import { FunLoadingIndicator } from "../components/FunLoadingIndicator";
import { useCategoryFeed } from "../hooks/useCategoryFeed";
import { Article } from "../types/Article";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { useReadingProgressOptional } from "../context/ReadingProgressContext";
import { useSavedArticles } from "../context/SavedArticlesContext";
import { ArticleProgressIndicator } from "../components/ArticleProgressIndicator";
import { ScaleButton } from "../components/ScaleButton";
import { typography } from "../theme/typography";
import { ReadingProgress } from "../types/ReadingProgress";
import * as Haptics from "expo-haptics";
import { HeroHeader } from "../components/HeroHeader";
import { Home as HomeIcon } from "lucide-react-native";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

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

const isContinueReadingItem = (item: ContinueReadingItem | null): item is ContinueReadingItem => {
  return item !== null;
};

const FeedStatusBanner = ({ message }: { message: string }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.statusBanner} testID="home-feed-status">
      <Text style={styles.statusBannerText}>{message}</Text>
    </View>
  );
};

const ContinueReadingSection = ({
  items,
  onPress,
  showAll,
  onToggleShowAll,
  lastUpdated,
}: {
  items: ContinueReadingItem[];
  onPress: (article: Article) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
  lastUpdated: Date | null;
}) => {
  const styles = useThemedStyles(createStyles);

  if (!items.length) return null;

  const visibleItems = showAll ? items : items.slice(0, 3);
  const canToggle = items.length > 3;
  return (
    <View style={styles.continueContainer} testID="continue-reading">
      <View style={styles.continueHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.continueTitle}>Continue Reading</Text>
          <Text style={styles.continueSubtitle}>
            {items.length === 1
              ? "1 story waiting where you left off"
              : `${items.length} stories waiting where you left off`}
          </Text>
        </View>
        {lastUpdated && <Text style={styles.updatedBadge}>{formatUpdatedAgo(lastUpdated)}</Text>}
        {canToggle && (
          <Pressable
            hitSlop={8}
            onPress={onToggleShowAll}
            accessibilityRole="button"
            accessibilityLabel={showAll ? "Hide extra continue reading stories" : "Show all continue reading stories"}
          >
            <Text style={styles.continueAction}>{showAll ? "Hide" : "Show all"}</Text>
          </Pressable>
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
  const { colors, isDark } = useThemeOptional();
  const styles = useThemedStyles(createStyles);

  const { articles, loading, error, refreshing, stale, lastUpdated, refresh } = useCategoryFeed("Top");
  const [showAllContinue, setShowAllContinue] = React.useState(false);
  const { inProgressArticles } = useReadingProgressOptional();
  const { savedArticles } = useSavedArticles();
  const profileContext = useProfilesOptional();
  const recordLastFetchedRef = React.useRef(profileContext?.recordLastFetchedArticles);

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
      .filter(isContinueReadingItem);
  }, [inProgressArticles, savedArticles, articles]);

  const handleRetry = React.useCallback(() => {
    refresh();
  }, [refresh]);

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

  const showSkeleton = articles.length === 0 && (loading || refreshing);
  const showErrorState = !showSkeleton && !!error && articles.length === 0;
  const showEmptyState = !loading && !refreshing && !error && articles.length === 0;

  const renderHeroHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top + spacing.sm }]}>
      <HeroHeader
        title="Morning Brief"
        subtitle={
          lastUpdated
            ? `${formatUpdatedAgo(lastUpdated)}. A finite catch-up on the Pittsburgh stories worth your attention.`
            : "A finite catch-up on the Pittsburgh stories worth your attention."
        }
        Icon={HomeIcon}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      {showSkeleton ? (
        <View style={styles.flexContent}>
          {renderHeroHeader()}
          <View style={styles.centerContent}>
            <FunLoadingIndicator message="Preparing your morning brief…" />
          </View>
        </View>
      ) : showErrorState ? (
        <View style={styles.flexContent}>
          {renderHeroHeader()}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>
                We couldn't refresh your brief
              </Text>
              <Text style={styles.errorSubtitle}>
                {error}
              </Text>
              <Pressable
                onPress={handleRetry}
                accessibilityRole="button"
                accessibilityLabel="Retry loading the morning brief"
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : showEmptyState ? (
        <View style={styles.flexContent}>
          {renderHeroHeader()}
          <View style={styles.centerContent}>
            <Text style={styles.emptyTitle}>You're caught up for now.</Text>
            <Text style={styles.emptySubtitle}>Pull to refresh when you're ready to check again.</Text>
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
          ListHeaderComponent={() => (
            <>
              {renderHeroHeader()}
              {error && articles.length > 0 ? (
                <FeedStatusBanner message="Couldn't load fresh stories. Showing the last successful update." />
              ) : stale ? (
                <FeedStatusBanner message="Showing your last saved brief while we check for fresh stories." />
              ) : null}
              {isContinueReadingEnabled && (
                <ContinueReadingSection
                  items={continueReadingItems}
                  onPress={(article) => navigation.navigate("Article", { article })}
                  showAll={showAllContinue}
                  onToggleShowAll={handleToggleShowAll}
                  lastUpdated={lastUpdated}
                />
              )}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Brief</Text>
                <Text style={styles.sectionSubtitle}>
                  Start here, read what matters, then be done.
                </Text>
              </View>
            </>
          )}
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
  flexContent: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
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
  continueAction: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.tint,
    fontWeight: "600",
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
  statusBanner: {
    marginHorizontal: spacing.gutter,
    marginTop: spacing.sm,
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
	  sectionHeader: {
	    paddingHorizontal: spacing.gutter,
	    paddingTop: spacing.lg,
	    paddingBottom: spacing.sm,
	  },
	  sectionTitle: {
	    fontFamily: typography.fontFamily.serif,
	    fontSize: typography.size.xl,
	    fontWeight: "700",
	    color: colors.text,
	  },
	  sectionSubtitle: {
	    marginTop: spacing.xs,
	    fontFamily: typography.fontFamily.sans,
	    fontSize: typography.size.sm,
	    color: colors.textSecondary,
	  },
	  errorCard: {
	    marginHorizontal: spacing.gutter,
	    padding: spacing.lg,
	    borderRadius: 14,
	    backgroundColor: colors.surface,
	    borderWidth: StyleSheet.hairlineWidth,
	    borderColor: colors.border,
	  },
	  errorTitle: {
	    fontFamily: typography.fontFamily.serif,
	    fontSize: typography.size.xl,
	    fontWeight: "700",
	    color: colors.text,
	    marginBottom: spacing.xs,
	  },
	  errorSubtitle: {
	    fontFamily: typography.fontFamily.sans,
	    fontSize: typography.size.sm,
	    color: colors.textSecondary,
	    marginBottom: spacing.md,
	  },
	  retryButton: {
	    minHeight: 44,
	    alignItems: "center",
	    justifyContent: "center",
	    borderRadius: 12,
	    backgroundColor: colors.tintTransparent,
	    paddingHorizontal: spacing.md,
	  },
	  retryButtonText: {
	    fontFamily: typography.fontFamily.sans,
	    fontSize: typography.size.md,
	    fontWeight: "700",
	    color: colors.tint,
	  },
	  emptyTitle: {
	    fontFamily: typography.fontFamily.serif,
	    fontSize: typography.size.xl,
    color: colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  });
