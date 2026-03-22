import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { Sparkles, ArrowRight, Zap, Palette, BookOpen } from "lucide-react-native";

type WhatsNewScreenProps = {
  navigation: {
    goBack: () => void;
  };
};

const FEATURES = [
  {
    id: "rebrand",
    title: "New App Name: Abridgd",
    description: 'We\'ve rebranded to "Abridgd" for a more unique presence on the App Store.',
    icon: Sparkles,
    color: "#FF6B6B",
  },
  {
    id: "improved-build",
    title: "Improved Build System",
    description:
      "Better iOS and Android support with EAS Build integration for faster, more reliable updates.",
    icon: Zap,
    color: "#4ECDC4",
  },
  {
    id: "branding-standards",
    title: "Brand Standards",
    description: "Comprehensive branding guidelines to maintain consistency across the app.",
    icon: Palette,
    color: "#95E1D3",
  },
  {
    id: "documentation",
    title: "Enhanced Documentation",
    description: "Updated guides for development, deployment, and iOS TestFlight integration.",
    icon: BookOpen,
    color: "#6C5CE7",
  },
];

export function WhatsNewScreen({ navigation }: WhatsNewScreenProps) {
  const insets = useSafeAreaInsets();
  const [dismissedFeatures, setDismissedFeatures] = useState<Set<string>>(new Set());

  const handleDismissFeature = (id: string) => {
    const updated = new Set(dismissedFeatures);
    updated.add(id);
    setDismissedFeatures(updated);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const visibleFeatures = FEATURES.filter((f) => !dismissedFeatures.has(f.id));
  const allDismissed = visibleFeatures.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Sparkles color={colors.tint} size={32} strokeWidth={2} />
            <Text style={styles.title}>What's New</Text>
            <Text style={styles.subtitle}>
              {allDismissed
                ? "You've seen all the updates!"
                : `v1.1.0 — ${visibleFeatures.length} new feature${
                    visibleFeatures.length !== 1 ? "s" : ""
                  }`}
            </Text>
          </View>
        </View>

        {/* Features List */}
        {!allDismissed && (
          <View style={styles.featuresList}>
            {visibleFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <View
                  key={feature.id}
                  style={[styles.featureCard, { borderLeftColor: feature.color }]}
                >
                  <View style={styles.featureHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: `${feature.color}20` }]}>
                      <Icon color={feature.color} size={24} strokeWidth={2} />
                    </View>
                    <View style={styles.featureTitleContainer}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                    </View>
                  </View>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                  <TouchableOpacity
                    onPress={() => handleDismissFeature(feature.id)}
                    style={styles.dismissButton}
                  >
                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {allDismissed && (
          <View style={styles.emptyState}>
            <Sparkles color={colors.tertiaryLabel} size={48} strokeWidth={1.5} />
            <Text style={styles.emptyStateText}>
              You're all caught up! Check back soon for more updates.
            </Text>
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>See the Full Changelog</Text>
          <Text style={styles.infoText}>
            For a complete list of changes, improvements, and bug fixes, check out CHANGELOG.md in
            the project documentation.
          </Text>
        </View>
      </ScrollView>

      {/* Close Button */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom ? insets.bottom + 8 : 16,
          },
        ]}
      >
        <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.7}>
          <Text style={styles.closeButtonText}>Done</Text>
          <ArrowRight color={colors.background} size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: 32,
    alignItems: "flex-start",
  },
  headerContent: {
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.size.xxl,
    fontWeight: "700",
    color: colors.label,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.secondaryLabel,
    fontWeight: "500",
  },
  featuresList: {
    marginBottom: 32,
    gap: 16,
  },
  featureCard: {
    backgroundColor: colors.groupedBackground,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 8,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureTitleContainer: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.base,
    fontWeight: "600",
    color: colors.label,
  },
  featureDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.secondaryLabel,
    lineHeight: 20,
    marginBottom: 12,
  },
  dismissButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.separator,
  },
  dismissButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.xs,
    fontWeight: "500",
    color: colors.secondaryLabel,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.base,
    color: colors.secondaryLabel,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: `${colors.tint}10`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.tint}30`,
    marginBottom: 24,
  },
  infoTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    fontWeight: "600",
    color: colors.label,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.secondaryLabel,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    backgroundColor: colors.background,
  },
  closeButton: {
    backgroundColor: colors.tint,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  closeButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.base,
    fontWeight: "600",
    color: colors.background,
  },
});
