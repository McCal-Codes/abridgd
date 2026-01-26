import React from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { useProfilesOptional } from "../context/ProfileContext";
import { ArticleCard, ArticleCardSkeleton } from "../components/ArticleCard";
import { FunLoadingIndicator } from "../components/FunLoadingIndicator";
import { fetchArticlesByCategory, getLastFetchedAt } from "../services/RssService";
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
    setLoading(true);
    const load = async () => {
      try {
        setError(null);
        const data = await fetchArticlesByCategory(category);
        setArticles(data);
        profileContext?.recordLastFetchedArticles?.(data.map((a) => a.id));
        const fetchedAt = getLastFetchedAt(category);
        setLastUpdated(fetchedAt ? new Date(fetchedAt) : new Date());
      } catch (e: any) {
        setError(e?.message || "Failed to load articles.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category]);

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
            <Text
              onPress={() => {
                setLoading(true);
                setError(null);
                fetchArticlesByCategory(category)
                  .then((data) => {
                    setArticles(data);
                    profileContext?.recordLastFetchedArticles?.(data.map((a) => a.id));
                    const fetchedAt = getLastFetchedAt(category);
                    setLastUpdated(fetchedAt ? new Date(fetchedAt) : new Date());
                    setLoading(false);
                  })
                  .catch((e) => {
                    setError(e?.message || "Failed to load articles.");
                    setLoading(false);
                  });
              }}
              style={{ color: colors.tint }}
            >
              Retry
            </Text>
          </View>
        </View>
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
          ListHeaderComponent={
            <View style={[styles.headerContainer, { paddingTop: insets.top + spacing.sm }]}>
              <HeroHeader
                title={category}
                subtitle={lastUpdated ? formatUpdatedAgo(lastUpdated) : undefined}
                subtitleTestID="section-updated"
                Icon={headerIcon}
              />
            </View>
          }
          refreshing={refreshing}
          onRefresh={async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {
              // noop if haptics unavailable
            }
            setRefreshing(true);
            setError(null);
            try {
              const data = await fetchArticlesByCategory(category, { forceRefresh: true });
              setArticles(data);
              profileContext?.recordLastFetchedArticles?.(data.map((a) => a.id));
              const fetchedAt = getLastFetchedAt(category);
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
  listContent: {
    paddingBottom: spacing.lg,
  },
  emptyText: {
    fontFamily: typography.fontFamily.sans,
    color: colors.textSecondary,
  },
});
