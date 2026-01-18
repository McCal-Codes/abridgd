import React from "react";
import { View, FlatList, StyleSheet, StatusBar, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { ScrollContext } from "../context/ScrollContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArticleCard } from "../components/ArticleCard";
import { FunLoadingIndicator } from "../components/FunLoadingIndicator";
import { fetchArticlesByCategory } from "../services/RssService";
import { Article } from "../types/Article";
import { colors } from "../theme/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { scrollY } = React.useContext(ScrollContext);
  const insets = useSafeAreaInsets();
  const {
    tabBarHeight,
    tabBarBlur,
    allowContentUnderTabBar,
    tabBarStyle,
    tabBarDockedHeight,
    tabBarFloatingHeight,
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
        const data = await fetchArticlesByCategory("Top");
        setArticles(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load articles.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {loading ? (
        <FunLoadingIndicator message="Fetching top stories..." />
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface }}>
            <Animated.Text style={{ color: colors.systemRed, marginBottom: 8 }}>
              Network error
            </Animated.Text>
            <Animated.Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
              {error}
            </Animated.Text>
            <Animated.Text
              onPress={() => {
                setLoading(true);
                setError(null);
                fetchArticlesByCategory("Top")
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
            </Animated.Text>
          </View>
        </View>
      ) : (
        <Animated.FlatList
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
          // wire scroll to the shared scrollY value so tab bar can animate
          onScroll={onScroll}
          scrollEventThrottle={16}
          onRefresh={() => {
            setLoading(true);
            setError(null);
            fetchArticlesByCategory("Top")
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
  listContent: {
    paddingBottom: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
