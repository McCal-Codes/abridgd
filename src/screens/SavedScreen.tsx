import React from "react";
import { View, FlatList, StyleSheet, Text, TextInput, Pressable, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { ArticleCard } from "../components/ArticleCard";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { useSavedArticles } from "../context/SavedArticlesContext";
import { ScaleButton } from "../components/ScaleButton";
import { Bookmark, Star as Sparkles, Search, SlidersHorizontal, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useReadingProgressOptional } from "../context/ReadingProgressContext";
import { ArticleCategory } from "../types/Article";
import { HeroHeader } from "../components/HeroHeader";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

export const SavedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const { savedArticles } = useSavedArticles();
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(new Date());
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [recentQueries, setRecentQueries] = React.useState<string[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedSources, setSelectedSources] = React.useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = React.useState<Set<ArticleCategory>>(
    new Set(),
  );
  const [selectedStatus, setSelectedStatus] = React.useState<
    "unread" | "in-progress" | "completed" | null
  >(null);
  const [selectedDateRange, setSelectedDateRange] = React.useState<
    "today" | "week" | "month" | "older" | null
  >(null);
  const [sortBy, setSortBy] = React.useState<
    "newest" | "oldest" | "progress" | "length" | "source"
  >("newest");
  const { top: insetTop } = useSafeAreaInsets();
  const insets = useSafeAreaInsets();
  const { getProgress } = useReadingProgressOptional();
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

  const handleRefresh = React.useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // best-effort haptic
    }
    setRefreshing(true);
    // Placeholder for future metadata refresh (e.g., view/comment counts)
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 400);
  }, []);

  const formatUpdatedAgo = React.useCallback((updated: Date | null): string | undefined => {
    if (!updated) return undefined;
    const diffMs = Date.now() - updated.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSeconds < 60) return "Updated just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Updated ${diffDays}d ago`;
  }, []);

  // Debounce search input
  React.useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const filteredArticles = React.useMemo(() => {
    const query = debouncedQuery.toLowerCase();
    const matchesQuery = (a: any) => {
      const haystack = [a.headline, a.source, a.category, a.summary, a.body]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return !query || haystack.includes(query);
    };

    const matchesSource =
      selectedSources.size === 0 ? () => true : (a: any) => selectedSources.has(a.source);
    const matchesCategory =
      selectedCategories.size === 0 ? () => true : (a: any) => selectedCategories.has(a.category);
    const matchesStatus = (a: any) => {
      if (!selectedStatus) return true;
      const progress = getProgress ? getProgress(a.id) : undefined;
      const status = progress?.status ?? "unread";
      return status === selectedStatus;
    };
    const matchesDate = (a: any) => {
      if (!selectedDateRange) return true;
      const published = a.publishedAt || 0;
      const now = Date.now();
      const diffDays = (now - published) / (1000 * 60 * 60 * 24);
      switch (selectedDateRange) {
        case "today":
          return diffDays < 1;
        case "week":
          return diffDays < 7;
        case "month":
          return diffDays < 30;
        case "older":
          return diffDays >= 30;
        default:
          return true;
      }
    };

    return savedArticles.filter(
      (a) =>
        matchesQuery(a) &&
        matchesSource(a) &&
        matchesCategory(a) &&
        matchesStatus(a) &&
        matchesDate(a),
    );
  }, [
    debouncedQuery,
    savedArticles,
    selectedSources,
    selectedCategories,
    selectedStatus,
    selectedDateRange,
    getProgress,
  ]);

  const sortedArticles = React.useMemo(() => {
    const list = [...filteredArticles];
    const progressFor = (id: string) =>
      getProgress ? (getProgress(id)?.completionPercentage ?? 0) : 0;
    list.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (a.publishedAt || 0) - (b.publishedAt || 0);
        case "progress":
          return progressFor(b.id) - progressFor(a.id);
        case "length":
          return (a.readTimeMinutes || 0) - (b.readTimeMinutes || 0);
        case "source":
          return (a.source || "").localeCompare(b.source || "");
        case "newest":
        default:
          return (b.publishedAt || 0) - (a.publishedAt || 0);
      }
    });
    return list;
  }, [filteredArticles, sortBy, getProgress]);

  const highlightMatch = React.useCallback(
    (text: string) => {
      const query = debouncedQuery;
      if (!query) return <Text style={styles.resultHeadline}>{text}</Text>;
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")})`, "ig");
      const parts = text.split(regex);
      return (
        <Text style={styles.resultHeadline}>
          {parts.map((part, idx) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <Text key={idx} style={styles.highlight}>
                {part}
              </Text>
            ) : (
              <Text key={idx}>{part}</Text>
            ),
          )}
        </Text>
      );
    },
    [debouncedQuery],
  );

  const addRecentQuery = React.useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      setRecentQueries((prev) => {
        const next = [trimmed, ...prev.filter((q) => q !== trimmed)].slice(0, 5);
        return next;
      });
    },
    [setRecentQueries],
  );

  const toggleSearch = React.useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchQuery("");
      setDebouncedQuery("");
    }
  }, [showSearch]);

  const toggleFilters = React.useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setShowFilters((prev) => !prev);
  }, []);

  const clearFilters = React.useCallback(() => {
    setSelectedSources(new Set());
    setSelectedCategories(new Set());
    setSelectedStatus(null);
    setSelectedDateRange(null);
  }, []);

  const hasActiveFiltersOrSearch = React.useMemo(
    () =>
      debouncedQuery.length > 0 ||
      selectedSources.size > 0 ||
      selectedCategories.size > 0 ||
      selectedStatus !== null ||
      selectedDateRange !== null,
    [
      debouncedQuery.length,
      selectedCategories.size,
      selectedDateRange,
      selectedSources.size,
      selectedStatus,
    ],
  );

  const clearSearchAndFilters = React.useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // best-effort haptic
    }
    setSearchQuery("");
    setDebouncedQuery("");
    clearFilters();
    setShowFilters(false);
  }, [clearFilters]);

  const availableSources = React.useMemo(
    () => Array.from(new Set(savedArticles.map((a) => a.source))).sort(),
    [savedArticles],
  );

  const availableCategories = React.useMemo(
    () => Array.from(new Set(savedArticles.map((a) => a.category))).sort(),
    [savedArticles],
  );

  const searchAnim = React.useRef(new Animated.Value(0)).current;
  const filterAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: showSearch ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [showSearch, searchAnim]);

  const searchTranslateY = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 0],
  });

  React.useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilters ? 1 : 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [showFilters, filterAnim]);

  const filterTranslateY = filterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insetTop + spacing.sm }]}>
        <HeroHeader
          title="Saved"
          subtitle={lastUpdated ? formatUpdatedAgo(lastUpdated) : undefined}
          Icon={Bookmark}
        />
        <View style={styles.topActions}>
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={showSearch ? "Close search" : "Open search"}
            style={styles.iconButton}
            onPress={toggleSearch}
          >
            {showSearch ? (
              <X size={18} color={colors.text} />
            ) : (
              <Search size={18} color={colors.text} />
            )}
          </Pressable>
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={showFilters ? "Hide filters" : "Show filters"}
            style={styles.iconButton}
            onPress={toggleFilters}
          >
            <SlidersHorizontal size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: searchAnim,
            transform: [{ translateY: searchTranslateY }],
            height: showSearch ? undefined : 0,
          },
        ]}
        pointerEvents={showSearch ? "auto" : "none"}
      >
        <TextInput
          placeholder="Search saved articles"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => addRecentQuery(searchQuery)}
          returnKeyType="search"
          style={[
            styles.searchInput,
            { backgroundColor: colors.secondaryBackground, color: colors.text },
          ]}
        />
        {recentQueries.length > 0 && (
          <View style={styles.recentRow}>
            {recentQueries.map((q) => (
              <Pressable
                key={q}
                onPress={() => {
                  setSearchQuery(q);
                  addRecentQuery(q);
                }}
                style={styles.recentChip}
              >
                <Text style={styles.recentChipText}>{q}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.filterContainer,
          {
            opacity: filterAnim,
            transform: [{ translateY: filterTranslateY }],
            height: showFilters ? undefined : 0,
          },
        ]}
        pointerEvents={showFilters ? "auto" : "none"}
      >
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filters</Text>
          <Text style={styles.filterCount}>
            {filteredArticles.length} {filteredArticles.length === 1 ? "result" : "results"}
          </Text>
          <Pressable onPress={clearFilters} hitSlop={8} accessibilityLabel="Clear filters">
            <Text style={styles.clearFilters}>Clear</Text>
          </Pressable>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Sources</Text>
          <View style={styles.chipRow}>
            {availableSources.map((source) => {
              const active = selectedSources.has(source);
              return (
                <Pressable
                  key={source}
                  onPress={() => {
                    setSelectedSources((prev) => {
                      const next = new Set(prev);
                      if (active) next.delete(source);
                      else next.add(source);
                      return next;
                    });
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{source}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Categories</Text>
          <View style={styles.chipRow}>
            {availableCategories.map((cat) => {
              const active = selectedCategories.has(cat);
              return (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setSelectedCategories((prev) => {
                      const next = new Set(prev);
                      if (active) next.delete(cat);
                      else next.add(cat);
                      return next;
                    });
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Reading status</Text>
          <View style={styles.chipRow}>
            {["unread", "in-progress", "completed"].map((status) => {
              const active = selectedStatus === status;
              return (
                <Pressable
                  key={status}
                  onPress={() => setSelectedStatus(active ? null : (status as any))}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{status}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Date added</Text>
          <View style={styles.chipRow}>
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "This week" },
              { key: "month", label: "This month" },
              { key: "older", label: "Older" },
            ].map((d) => {
              const active = selectedDateRange === d.key;
              return (
                <Pressable
                  key={d.key}
                  onPress={() => setSelectedDateRange(active ? null : (d.key as any))}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{d.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Sort</Text>
          <View style={styles.chipRow}>
            {[
              { key: "newest", label: "Newest" },
              { key: "oldest", label: "Oldest" },
              { key: "progress", label: "Progress" },
              { key: "length", label: "Length" },
              { key: "source", label: "Source" },
            ].map((s) => {
              const active = sortBy === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setSortBy(s.key as any)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>

      {savedArticles.length > 0 || hasActiveFiltersOrSearch ? (
        <FlatList
          testID="saved-list"
          data={sortedArticles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ScaleButton
              style={styles.resultCard}
              onPress={() => navigation.navigate("Article", { article: item })}
              accessibilityLabel={`Open ${item.headline}`}
            >
              {highlightMatch(item.headline)}
              <Text style={styles.resultMeta}>
                {item.source} • {item.category}
              </Text>
              {!!debouncedQuery && (
                <Text style={styles.resultSnippet} numberOfLines={2}>
                  {highlightMatch(item.summary || item.body || "")}
                </Text>
              )}
            </ScaleButton>
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
          ListHeaderComponent={
            lastUpdated ? (
              <View style={styles.updatedRow} testID="saved-updated">
                <Text style={styles.updatedLabel}>{formatUpdatedAgo(lastUpdated)}</Text>
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View
              style={[
                styles.noResultsContainer,
                {
                  paddingBottom: allowContentUnderTabBar
                    ? spacing.lg + insets.bottom + 8
                    : spacing.lg +
                      (tabBarStyle === "floating"
                        ? tabBarFloatingHeight || 64
                        : tabBarDockedHeight || tabBarHeight) +
                      insets.bottom +
                      spacing.md,
                },
              ]}
              testID="saved-no-results"
            >
              <Text style={styles.noResultsTitle}>No saved articles match</Text>
              <Text style={styles.noResultsSub}>
                {hasActiveFiltersOrSearch
                  ? "Try clearing filters or adjusting your keywords."
                  : "Try a different keyword or saved source."}
              </Text>
              {hasActiveFiltersOrSearch && (
                <ScaleButton style={styles.clearButton} onPress={clearSearchAndFilters}>
                  <Text style={styles.clearButtonText}>Clear search & filters</Text>
                </ScaleButton>
              )}
            </View>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-end",
    paddingHorizontal: spacing.gutter,
    marginTop: -spacing.lg,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondaryBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: spacing.gutter,
    overflow: "hidden",
  },
  searchInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    fontFamily: typography.fontFamily.sans,
  },
  recentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  recentChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.secondaryBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  recentChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  resultCard: {
    marginHorizontal: spacing.gutter,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    gap: spacing.xs,
  },
  resultHeadline: {
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.size.md,
    color: colors.text,
    fontWeight: "700",
  },
  highlight: {
    color: colors.tint,
  },
  resultMeta: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  resultSnippet: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  filterContainer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    overflow: "hidden",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.md,
    color: colors.text,
    fontWeight: "700",
  },
  filterCount: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  clearFilters: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.tint,
    fontWeight: "600",
  },
  filterGroup: {
    gap: spacing.xs,
  },
  filterLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    backgroundColor: colors.secondaryBackground,
  },
  chipActive: {
    backgroundColor: colors.tintTransparent,
    borderColor: colors.tint,
  },
  chipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.tint,
    fontWeight: "700",
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
  noResultsContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.gutter,
    gap: spacing.sm,
  },
  noResultsTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.size.lg,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  noResultsSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  clearButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.secondaryBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  clearButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    fontWeight: "600",
    color: colors.tint,
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
  updatedRow: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
  },
  updatedLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
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
