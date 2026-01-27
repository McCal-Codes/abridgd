import React from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { useProfilesOptional } from "../context/ProfileContext";
import { ArticleCard } from "../components/ArticleCard";
import { FunLoadingIndicator } from "../components/FunLoadingIndicator";
import { ScaleButton } from "../components/ScaleButton";
import {
  fetchArticlesByCategory,
  getCachedArticles,
  getLastFetchedAt,
} from "../services/RssService";
import { colors } from "../theme/colors";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { Article, ArticleCategory } from "../types/Article";
import { typography } from "../theme/typography";
import * as Haptics from "expo-haptics";
import { HeroHeader } from "../components/HeroHeader";
import { MapPin, Newspaper } from "lucide-react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SectionRouteProp = RouteProp<TabParamList, "Discover">;

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

export const SectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SectionRouteProp>();
  const category = route.params?.category as ArticleCategory;

  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const profileContext = useProfilesOptional?.();
  const recordLastFetchedRef = React.useRef(profileContext?.recordLastFetchedArticles);
  const fetchTokenRef = React.useRef(0);

  React.useEffect(() => {
    recordLastFetchedRef.current = profileContext?.recordLastFetchedArticles;
  }, [profileContext?.recordLastFetchedArticles]);

  const loadArticles = React.useCallback(
    async (options?: { forceRefresh?: boolean; showLoader?: boolean }) => {
      const token = ++fetchTokenRef.current;
      if (options?.showLoader) {
        setLoading(true);
      }
      if (options?.forceRefresh) {
        setRefreshing(true);
      }
      setError(null);
      try {
        const data = await fetchArticlesByCategory(category, {
          forceRefresh: options?.forceRefresh,
        });
        if (fetchTokenRef.current !== token) {
          return;
        }
        setArticles(data);
        recordLastFetchedRef.current?.(data.map((a) => a.id));
        const fetchedAt = getLastFetchedAt(category);
        setLastUpdated(fetchedAt ? new Date(fetchedAt) : new Date());
      } catch (err: any) {
        if (fetchTokenRef.current !== token) {
          return;
        }
        setError(err?.message || `Could not load ${category} stories.`);
      } finally {
        if (fetchTokenRef.current !== token) {
          return;
        }
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category],
  );

  const handleRetry = React.useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    void loadArticles({ forceRefresh: true, showLoader: true });
  }, [loadArticles]);
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
    const cached = getCachedArticles(category);
    if (cached?.length) {
      setArticles(cached);
      const fetchedAt = getLastFetchedAt(category);
      setLastUpdated(fetchedAt ? new Date(fetchedAt) : null);
      setLoading(false);
      setRefreshing(true);
      void loadArticles();
    } else {
      setLoading(true);
      void loadArticles({ showLoader: true });
    }
    return () => {
      fetchTokenRef.current += 1;
    };
  }, [category, loadArticles]);

  if (!loading && articles.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>No articles in {category}</Text>
      </View>
    );
  }

  const headerIcon = category === "Local" ? MapPin : Newspaper;

  const showSkeleton = loading && articles.length === 0;
  const showErrorState = !showSkeleton && !!error && articles.length === 0;
  const renderHeroHeader = React.useCallback(() => {
    const updatedAgo = formatUpdatedAgo(lastUpdated);
    return (
      <View style={styles.header}>
        <HeroHeader
          title={category}
          subtitle={updatedAgo || "Warming up your feed"}
          subtitleTestID="section-updated"
          Icon={headerIcon}
        />
      </View>
    );
  }, [category, headerIcon, lastUpdated]);

  return (
    <View style={styles.container}>
      {showSkeleton ? (
        <>
          {renderHeroHeader()}
          <View style={styles.loadingContainer}>
            <FunLoadingIndicator message={`Gathering ${category} stories…`} />
          </View>
        </>
      ) : showErrorState ? (
        <>
          {renderHeroHeader()}
          <View style={[styles.center, { flex: 1, paddingHorizontal: spacing.gutter }]}>
            <Text style={styles.errorTitle}>Can’t reach {category} news</Text>
            <Text style={styles.errorMessage}>{error || "Please try again shortly."}</Text>
            <ScaleButton style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </ScaleButton>
          </View>
        </>
      ) : (
        <FlatList
          testID="section-list"
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
          ListHeaderComponent={renderHeroHeader}
          refreshing={refreshing}
          onRefresh={async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {
              // noop if haptics unavailable
            }
            setError(null);
            setRefreshing(true);
            await loadArticles({ forceRefresh: true, showLoader: false });
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xl,
  },
  errorTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.size.lg,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  errorMessage: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.sm,
    width: 160,
    alignSelf: "center",
  },
  retryButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    fontWeight: "600",
    color: colors.background,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  emptyText: {
    fontFamily: typography.fontFamily.sans,
    color: colors.textSecondary,
  },
});
