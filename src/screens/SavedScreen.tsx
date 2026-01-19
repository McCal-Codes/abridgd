import React from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { ArticleCard } from "../components/ArticleCard";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { useSavedArticles } from "../context/SavedArticlesContext";
import { ScaleButton } from "../components/ScaleButton";
import { Bookmark, Sparkles } from "lucide-react-native";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

export const SavedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { savedArticles } = useSavedArticles();
  const insets = useSafeAreaInsets();
  const {
    tabBarHeight,
    allowContentUnderTabBar,
    tabBarStyle,
    tabBarDockedHeight,
    tabBarFloatingHeight,
    tabLayout,
  } = useSettings();

  const handleExplore = React.useCallback(() => {
    const targetTab = tabLayout === "comprehensive" ? "Top" : "Home";
    // Prefer switching tabs directly if available
    const parentNav = navigation.getParent?.();
    if (parentNav && parentNav.navigate) {
      parentNav.navigate(targetTab as never);
      return;
    }
    // Fallback: navigate via stack then tab
    navigation.navigate("Main");
    navigation.navigate(targetTab as never);
  }, [navigation, tabLayout]);

  return (
    <View style={styles.container}>
      {savedArticles.length > 0 ? (
        <FlatList
          data={savedArticles}
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
        />
      ) : (
        <View
          style={[
            styles.emptyContainer,
            {
              paddingBottom: allowContentUnderTabBar
                ? spacing.xl + insets.bottom + 8
                : spacing.xl +
                  (tabBarStyle === "floating"
                    ? tabBarFloatingHeight || 64
                    : tabBarDockedHeight || tabBarHeight) +
                  insets.bottom +
                  spacing.md,
            },
          ]}
          testID="saved-empty-state"
        >
          <View style={styles.illustrationShell}>
            <View style={styles.illustrationGlow} />
            <View style={styles.illustrationCard}>
              <Bookmark size={48} color={colors.tint} strokeWidth={1.5} />
            </View>
            <Sparkles size={18} color={colors.accent} style={styles.sparkleTop} />
            <Sparkles size={14} color={colors.tint} style={styles.sparkleBottom} />
          </View>

          <Text style={styles.emptyTitle}>Your reading list is empty</Text>
          <Text style={styles.emptySubText}>
            Save the stories you love to read them offline or later.
          </Text>

          <ScaleButton
            style={styles.ctaButton}
            onPress={handleExplore}
            accessibilityLabel="Explore top stories"
          >
            <Text style={styles.ctaText}>Explore Top Stories</Text>
          </ScaleButton>

          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>Tip</Text>
            <Text style={styles.tipText}>Swipe left on any article card to save it for later.</Text>
          </View>
        </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  illustrationShell: {
    width: 140,
    height: 140,
    borderRadius: 32,
    backgroundColor: colors.secondaryBackground,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  illustrationGlow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: colors.tint,
    opacity: 0.08,
  },
  illustrationCard: {
    width: 84,
    height: 94,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.separator,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  sparkleTop: {
    position: "absolute",
    top: 18,
    right: 18,
  },
  sparkleBottom: {
    position: "absolute",
    bottom: 22,
    left: 18,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.size.lg,
    color: colors.text,
    textAlign: "center",
  },
  emptySubText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.tint,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  ctaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.md,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  tipCard: {
    width: "100%",
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  tipLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    color: colors.tint,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  tipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
