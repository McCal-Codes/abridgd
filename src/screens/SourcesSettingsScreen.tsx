import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { RSS_FEEDS } from "../data/feedConfig";
import { ArticleCategory } from "../types/Article";
import { ComingSoon } from "../components/ComingSoon";
import {
  loadSourcePreferences,
  updateSourceEnabled,
  isSourceEnabled,
  getSourceKey,
  SourceOverrideMap,
} from "../utils/sourcePreferences";

export const SourcesSettingsScreen: React.FC = () => {
  const [overrides, setOverrides] = useState<SourceOverrideMap>({});
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const prefs = await loadSourcePreferences();
      if (mounted) {
        setOverrides(prefs.overrides);
        setLoadingPrefs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleSource = async (category: ArticleCategory, sourceName: string) => {
    const currentlyEnabled = isSourceEnabled(overrides, category, sourceName);
    const key = getSourceKey(category, sourceName);

    setOverrides((prev) => {
      const next: SourceOverrideMap = { ...prev };
      if (currentlyEnabled) {
        next[key] = false;
      } else {
        delete next[key];
      }
      return next;
    });

    try {
      const prefs = await updateSourceEnabled(category, sourceName, !currentlyEnabled);
      setOverrides(prefs.overrides);
    } catch (error) {
      Alert.alert("Error", "Couldn't update source preference. Please try again.");
      const prefs = await loadSourcePreferences();
      setOverrides(prefs.overrides);
    }
  };

  const categories: ArticleCategory[] = ["Top", "Local", "Business", "Sports", "Culture"];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>News Sources</Text>
        <Text style={styles.description}>
          Choose which RSS feeds to include in your news. Disable sources you don't want to see.
        </Text>

        {loadingPrefs ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Loading your source preferences…</Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {RSS_FEEDS[category].map((source) => {
                const sourceKey = getSourceKey(category, source.name);
                const isEnabled = isSourceEnabled(overrides, category, source.name);

                return (
                  <View key={sourceKey} style={styles.sourceRow}>
                    <View style={styles.sourceInfo}>
                      <Text style={styles.sourceName}>{source.name}</Text>
                      <Text style={styles.sourceUrl} numberOfLines={1}>
                        {source.url}
                      </Text>
                    </View>
                    <Switch
                      value={isEnabled}
                      onValueChange={() => toggleSource(category, source.name)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                  </View>
                );
              })}
            </View>
          ))
        )}

        {/* ADD CUSTOM SOURCE */}
        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Custom Feeds</Text>
          <ComingSoon
            variant="card"
            title="Add Custom RSS Feeds"
            description="The ability to add your own RSS feeds is coming soon. You can currently read from our curated sources."
            icon="rocket"
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Tip: You can add any RSS or Atom feed. Make sure the URL ends with /feed, /rss, or
            .xml
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
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
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
  sourceUrl: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
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
});
