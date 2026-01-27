import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { RSS_FEEDS } from "../data/feedConfig";
import { ArticleCategory } from "../types/Article";
import {
  loadSourcePreferences,
  updateSourceEnabled,
  isSourceEnabled,
  getSourceKey,
  SourceOverrideMap,
  addCustomFeed,
  removeCustomFeed,
  CustomFeed,
  clearOverridesForCategory,
  setCategoryEnabled,
} from "../utils/sourcePreferences";
import { FEED_TEMPLATES } from "../data/feedTemplates";
import { validateFeedSource, FeedValidationResult } from "../services/RssService";

export const SourcesSettingsScreen: React.FC = () => {
  const [overrides, setOverrides] = useState<SourceOverrideMap>({});
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [customFeeds, setCustomFeeds] = useState<CustomFeed[]>([]);
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedCategory, setNewFeedCategory] = useState<ArticleCategory>("Top");
  const [validationResult, setValidationResult] = useState<FeedValidationResult | null>(null);
  const [validatingFeed, setValidatingFeed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const prefs = await loadSourcePreferences();
      if (mounted) {
        setOverrides(prefs.overrides);
        setCustomFeeds(prefs.customFeeds || []);
        setLoadingPrefs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleSource = async (
    category: ArticleCategory,
    sourceName: string,
    defaultEnabled = true,
  ) => {
    const currentlyEnabled = isSourceEnabled(overrides, category, sourceName, defaultEnabled);
    const key = getSourceKey(category, sourceName);
    const nextEnabled = !currentlyEnabled;

    setOverrides((prev) => {
      const next: SourceOverrideMap = { ...prev };
      if (nextEnabled === defaultEnabled) {
        delete next[key];
      } else {
        next[key] = nextEnabled;
      }
      return next;
    });

    try {
      const prefs = await updateSourceEnabled(category, sourceName, nextEnabled, defaultEnabled);
      setOverrides(prefs.overrides);
    } catch (error) {
      Alert.alert("Error", "Couldn't update source preference. Please try again.");
      const prefs = await loadSourcePreferences();
      setOverrides(prefs.overrides);
      setCustomFeeds(prefs.customFeeds || []);
    }
  };

  const deriveNameFromUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace("www.", "");
    } catch (error) {
      return url;
    }
  };

  const handleValidateAndAdd = async () => {
    setFormError(null);
    setValidationResult(null);

    const url = newFeedUrl.trim();
    const name = (newFeedName || deriveNameFromUrl(url)).trim();

    if (!url) {
      setFormError("Please enter a feed URL ending in /feed, /rss, or .xml.");
      return;
    }

    if (!name) {
      setFormError("Please enter a name for this feed.");
      return;
    }

    setValidatingFeed(true);
    try {
      const validation = await validateFeedSource({ name, url });
      setValidationResult(validation);

      if (validation.status !== "ok") {
        setFormError(validation.message);
        return;
      }

      const prefs = await addCustomFeed({
        name,
        url,
        category: newFeedCategory,
        health: validation,
      });

      setOverrides(prefs.overrides);
      setCustomFeeds(prefs.customFeeds || []);
      setNewFeedName("");
      setNewFeedUrl("");
      setFormError(null);
      Alert.alert("Custom feed added", `${name} was added and enabled.`);
    } catch (error: any) {
      setFormError(error?.message || "Unable to add feed.");
    } finally {
      setValidatingFeed(false);
    }
  };

  const handleRemoveCustomFeed = async (id: string) => {
    const prefs = await removeCustomFeed(id);
    setOverrides(prefs.overrides);
    setCustomFeeds(prefs.customFeeds || []);
  };

  const applyTemplateFeed = (feed: { name: string; url: string; category: ArticleCategory }) => {
    setNewFeedName(feed.name);
    setNewFeedUrl(feed.url);
    setNewFeedCategory(feed.category);
    setValidationResult(null);
    setFormError(null);
  };

  const categories: ArticleCategory[] = ["Top", "Local", "Business", "Sports", "Culture"];

  const filterSources = (category: ArticleCategory) => {
    const query = filterQuery.trim().toLowerCase();
    const sources = RSS_FEEDS[category];
    if (!query) return sources;
    return sources.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.url.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query),
    );
  };

  const getCounts = (category: ArticleCategory) => {
    const baseSources = RSS_FEEDS[category];
    const customCategoryFeeds = customFeeds.filter((f) => f.category === category);
    const total = baseSources.length + customCategoryFeeds.length;

    let enabled = 0;
    baseSources.forEach((source) => {
      const defaultEnabled = source.defaultEnabled ?? true;
      if (isSourceEnabled(overrides, category, source.name, defaultEnabled)) enabled += 1;
    });
    customCategoryFeeds.forEach((feed) => {
      if (isSourceEnabled(overrides, feed.category, feed.name, true)) enabled += 1;
    });

    return { enabled, total };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>News Sources</Text>
        <Text style={styles.description}>
          Choose which RSS feeds to include in your news. Disable sources you don't want to see.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Filter by name or URL"
          placeholderTextColor={colors.textSecondary}
          value={filterQuery}
          onChangeText={setFilterQuery}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Filter sources"
        />

        {loadingPrefs ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Loading your source preferences…</Text>
          </View>
        ) : (
          categories.map((category) => {
            const baseSources = RSS_FEEDS[category];
            const customNames = customFeeds.filter((f) => f.category === category).map((f) => f.name);
            const visibleSources = filterSources(category);
            const counts = getCounts(category);

            return (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  <View style={styles.categoryMeta}>
                    <Text style={styles.countBadge}>{`${counts.enabled}/${counts.total} on`}</Text>
                  </View>
                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      style={styles.categoryChip}
                      onPress={async () => {
                        const prefs = await setCategoryEnabled(
                          category,
                          baseSources.map((s) => s.name),
                          true,
                          true,
                          customNames,
                        );
                        setOverrides(prefs.overrides);
                        setCustomFeeds(prefs.customFeeds || []);
                      }}
                      accessibilityRole="button"
                    >
                      <Text style={styles.categoryChipText}>Enable all</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.categoryChip}
                      onPress={async () => {
                        const prefs = await setCategoryEnabled(
                          category,
                          baseSources.map((s) => s.name),
                          false,
                          true,
                          customNames,
                        );
                        setOverrides(prefs.overrides);
                        setCustomFeeds(prefs.customFeeds || []);
                      }}
                      accessibilityRole="button"
                    >
                      <Text style={styles.categoryChipText}>Disable all</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        const prefs = await clearOverridesForCategory(category);
                        setOverrides(prefs.overrides);
                        setCustomFeeds(prefs.customFeeds || []);
                      }}
                      accessibilityRole="button"
                    >
                      <Text style={styles.restoreLink}>Defaults</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {visibleSources.map((source) => {
                  const sourceKey = getSourceKey(category, source.name);
                  const defaultEnabled = source.defaultEnabled ?? true;
                  const isEnabled = isSourceEnabled(overrides, category, source.name, defaultEnabled);

                return (
                  <View key={sourceKey} style={styles.sourceRow}>
                    <View style={styles.sourceInfo}>
                      <Text style={styles.sourceName}>{source.name}</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.sourceUrl} numberOfLines={1}>
                          {source.url}
                        </Text>
                        {!defaultEnabled && <Text style={styles.defaultOff}>Default off</Text>}
                      </View>
                      {!defaultEnabled && (
                        <Text style={styles.defaultOffNote}>
                          Temporarily disabled while the feed is down; toggle on if it recovers.
                        </Text>
                      )}
                    </View>
                    <Switch
                      value={isEnabled}
                      onValueChange={() => toggleSource(category, source.name, defaultEnabled)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                  </View>
                );
                })}
              </View>
            );
          })
        )}

        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Templates by Location</Text>
          <Text style={styles.sectionDescription}>
            Pick a template to prefill the form with curated feeds for that area. You can adjust the
            name, URL, or category before saving.
          </Text>
          {FEED_TEMPLATES.map((template) => (
            <View key={template.id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <Text style={styles.templateTitle}>{template.label}</Text>
                <Text style={styles.templateSubtitle}>{template.description}</Text>
              </View>
              {template.feeds.map((feed) => (
                <TouchableOpacity
                  key={`${template.id}-${feed.name}`}
                  style={styles.templateFeedRow}
                  onPress={() => applyTemplateFeed(feed)}
                  accessibilityRole="button"
                >
                  <View style={styles.templateFeedInfo}>
                    <Text style={styles.templateFeedName}>{feed.name}</Text>
                    <Text style={styles.templateFeedUrl} numberOfLines={1}>
                      {feed.url}
                    </Text>
                    <Text
                      style={styles.templateFeedMeta}
                    >{`${template.location} • ${feed.category}`}</Text>
                  </View>
                  <Text style={styles.templateAction}>Use</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Add a Custom RSS Feed</Text>
          <Text style={styles.sectionDescription}>
            We’ll validate the feed before saving so retired or failing feeds are caught early.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Feed name"
            placeholderTextColor={colors.textSecondary}
            value={newFeedName}
            onChangeText={(text) => setNewFeedName(text)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Feed URL (https://example.com/feed)"
            placeholderTextColor={colors.textSecondary}
            value={newFeedUrl}
            onChangeText={(text) => setNewFeedUrl(text)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <View style={styles.chipRow}>
            {categories.map((cat) => {
              const selected = newFeedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setNewFeedCategory(cat)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, validatingFeed && styles.primaryButtonDisabled]}
            onPress={handleValidateAndAdd}
            disabled={validatingFeed}
            accessibilityRole="button"
          >
            {validatingFeed ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Validate & Add Feed</Text>
            )}
          </TouchableOpacity>

          {formError && <Text style={styles.errorText}>{formError}</Text>}
          {validationResult && !formError && (
            <View style={styles.validationBox}>
              <Text style={styles.validationStatus}>
                Status: {validationResult.status.toUpperCase()}
              </Text>
              <Text style={styles.validationMessage}>{validationResult.message}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Your Custom Feeds</Text>
          {customFeeds.length === 0 ? (
            <Text style={styles.emptyState}>No custom feeds added yet.</Text>
          ) : (
            customFeeds.map((feed) => {
              const isEnabled = isSourceEnabled(overrides, feed.category, feed.name, true);
              const healthStatus = feed.health?.status ?? "unknown";
              const isHealthy = healthStatus === "ok";

              return (
                <View key={feed.id} style={styles.customFeedRow}>
                  <View style={styles.customFeedInfo}>
                    <Text style={styles.sourceName}>{feed.name}</Text>
                    <Text style={styles.sourceUrl} numberOfLines={1}>
                      {feed.url}
                    </Text>
                    <Text
                      style={styles.templateFeedMeta}
                    >{`${feed.category} • Added ${new Date(feed.addedAt).toLocaleDateString()}`}</Text>
                    {feed.health && (
                      <Text
                        style={[
                          styles.healthBadge,
                          isHealthy ? styles.healthOk : styles.healthWarn,
                        ]}
                      >
                        {isHealthy ? "Healthy" : "Needs attention"}: {feed.health.message}
                      </Text>
                    )}
                  </View>
                  <View style={styles.customFeedActions}>
                    <Switch
                      value={isEnabled}
                      onValueChange={() => toggleSource(feed.category, feed.name, true)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                    <TouchableOpacity
                      style={styles.destructiveButton}
                      onPress={() =>
                        Alert.alert(
                          "Remove feed?",
                          `Remove ${feed.name}? You can re-add it later.`,
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Remove",
                              style: "destructive",
                              onPress: () => handleRemoveCustomFeed(feed.id),
                            },
                          ],
                        )
                      }
                      accessibilityRole="button"
                    >
                      <Text style={styles.destructiveButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Tip: You can add any RSS or Atom feed. Make sure the URL ends with /feed, /rss, or .xml
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: 150,
  },
  header: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  sectionDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  categoryTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  countBadge: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  categoryChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.text,
  },
  restoreLink: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.primary,
  },
  sourceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sourceInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  sourceName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sourceUrl: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  defaultOff: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
  },
  defaultOffNote: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
    gap: spacing.sm,
    justifyContent: "center",
  },
  addButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  customForm: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  formLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedCategoryChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  selectedCategoryChipText: {
    color: colors.surface,
  },
  saveButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
  infoBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: "#F0F4F8",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  templateCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateHeader: {
    marginBottom: spacing.sm,
  },
  templateTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  templateSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  templateFeedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  templateFeedInfo: {
    flex: 1,
    paddingRight: spacing.md,
    gap: 2,
  },
  templateFeedName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  templateFeedUrl: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  templateFeedMeta: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  templateAction: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.background,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "700",
    color: colors.background,
  },
  errorText: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.error,
  },
  validationBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  validationStatus: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  validationMessage: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  emptyState: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  customFeedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  customFeedInfo: {
    flex: 1,
    gap: 2,
  },
  customFeedActions: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  healthBadge: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  healthOk: {
    color: "#0B7A00",
    backgroundColor: "#E6F4EA",
  },
  healthWarn: {
    color: colors.error,
    backgroundColor: "#FDECEC",
  },
  destructiveButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  destructiveButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "700",
    color: colors.error,
  },
});
