import React from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { ArticleCard } from "../components/ArticleCard";
import { FunLoadingIndicator } from "../components/FunLoadingIndicator";
import { fetchArticlesByCategory } from "../services/RssService";
import { colors } from "../theme/colors";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { Article, ArticleCategory } from "../types/Article";
import { typography } from "../theme/typography";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SectionRouteProp = RouteProp<TabParamList, "Discover">;

export const SectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SectionRouteProp>();
  const category = route.params?.category as ArticleCategory;

  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
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

  return (
    <View style={styles.container}>
      {loading ? (
        <FunLoadingIndicator message={`Loading ${category} news...`} />
      ) : error ? (
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
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              onPress={(article) => navigation.navigate("Article", { article: article })}
            />
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
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            setError(null);
            fetchArticlesByCategory(category)
              .then((data) => {
                setArticles(data);
                setLoading(false);
              })
              .catch((e) => {
                setError(e?.message || "Failed to refresh.");
                setLoading(false);
              });
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
