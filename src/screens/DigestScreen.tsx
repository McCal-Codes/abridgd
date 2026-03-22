import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { fetchDailyDigest, DigestItem } from "../services/AiService";
import { FunLoadingIndicator } from "../components/FunLoadingIndicator";
import { ArrowRight, Newspaper } from "lucide-react-native";
import { ScaleButton } from "../components/ScaleButton";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { HeroHeader } from "../components/HeroHeader";
import { useThemedStyles } from "../theme/useThemedStyles";

interface DigestScreenProps {
  isWelcomeBack?: boolean;
  onContinue?: () => void;
}

export const DigestScreen: React.FC<DigestScreenProps> = ({ isWelcomeBack, onContinue }) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { lastAppVisit, updateLastAppVisit, digestSummaryMode } = useSettings();
  const [digest, setDigest] = useState<DigestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const {
    tabBarHeight,
    allowContentUnderTabBar,
    tabBarStyle,
    tabBarDockedHeight,
    tabBarFloatingHeight,
  } = useSettings();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const load = async () => {
      try {
        const data = await fetchDailyDigest(lastAppVisit, digestSummaryMode);
        if (mounted) {
          setDigest(data);
        }
      } catch (error) {
        if (mounted) {
          setDigest([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }

        try {
          await updateLastAppVisit();
        } catch {
          // best-effort update; ignore failures
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateLastAppVisit is stable enough
  }, [digestSummaryMode, lastAppVisit, updateLastAppVisit]);

  const handleReadMore = (item: DigestItem) => {
    if (item.article) {
      if (onContinue) onContinue();
      navigation.navigate("Article", { article: item.article });
    }
  };

  const subtitleText = useMemo(() => {
    if (isWelcomeBack) {
      return "Here's what happened while you were gone.";
    }

    if (!lastAppVisit) {
      return `Your briefing for ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}.`;
    }

    const hoursSinceLastVisit = Math.floor((Date.now() - lastAppVisit) / (1000 * 60 * 60));
    if (hoursSinceLastVisit < 1) {
      return "You're all caught up with the latest news.";
    } else if (hoursSinceLastVisit < 24) {
      return `News from the last ${hoursSinceLastVisit} hour${hoursSinceLastVisit > 1 ? "s" : ""}.`;
    } else {
      const daysSince = Math.floor(hoursSinceLastVisit / 24);
      return `News from the last ${daysSince} day${daysSince > 1 ? "s" : ""}.`;
    }
  }, [isWelcomeBack, lastAppVisit]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
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
      >
        <View style={[styles.headerContainer, { paddingTop: spacing.md }]}>
          <HeroHeader
            title={isWelcomeBack ? "Welcome Back" : "Daily Digest"}
            subtitle={subtitleText}
            Icon={Newspaper}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <FunLoadingIndicator message="Brewing your daily digest..." />
          </View>
        ) : digest.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No new articles since your last visit.</Text>
            <Text style={styles.emptySubtext}>Check back later for updates!</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {digest.map((item, index) => (
              <View key={index} style={styles.digestItem}>
                <View style={styles.digestContent}>
                  <View style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.digestText}>{item.summary}</Text>
                  </View>
                  {item.article && (
                    <TouchableOpacity
                      style={styles.seeMore}
                      onPress={() => handleReadMore(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Read entire article: ${item.article?.headline ?? "Open article"}`}
                      accessibilityHint="Opens the full article"
                    >
                      <Text style={styles.seeMoreText}>Read Entire Article</Text>
                      <ArrowRight size={14} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {isWelcomeBack && !loading && (
          <ScaleButton
            style={styles.continueButton}
            onPress={onContinue || (() => navigation.navigate("Main"))}
            accessibilityLabel="Continue to News"
            accessibilityHint="Returns to the main news feed"
          >
            <Text style={styles.continueButtonText}>Continue to News</Text>
          </ScaleButton>
        )}

        {!loading && (
          <Text style={styles.footer}>
            This digest is automatically generated from top local sources without bias.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.gutter,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  digestItem: {
    marginBottom: spacing.xl,
  },
  digestContent: {
    gap: spacing.xs,
  },
  bulletRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  digestText: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  seeMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 24, // Align with text after bullet
    marginTop: 4,
  },
  seeMoreText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: spacing.xl,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    paddingBottom: spacing.xxl,
  },
  continueButton: {
    backgroundColor: colors.text,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  continueButtonText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xxl,
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  emptyText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  });
