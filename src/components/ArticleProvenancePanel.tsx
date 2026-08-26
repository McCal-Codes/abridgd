import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ArticleProvenance } from "../types/Article";
import { ThemeColors } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";

interface ArticleProvenancePanelProps {
  provenance?: ArticleProvenance;
}

const formatTimestamp = (timestamp: number): string =>
  new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const Row = ({ label, value }: { label: string; value: string }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
};

/**
 * Factual, non-personalized "Why this story?" content. Every field is either a static fact
 * (source, domain, category, publish time) or a plain statement of the enabled-source-list
 * inclusion rule — there is no ranking algorithm to describe, so none is implied.
 */
export const ArticleProvenancePanel: React.FC<ArticleProvenancePanelProps> = ({ provenance }) => {
  const styles = useThemedStyles(createStyles);

  if (!provenance) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Why this story?</Text>
        <Text style={styles.emptyText}>Source details aren't available for this story yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Why this story?</Text>
      <Row label="Source" value={`${provenance.sourceName} · ${provenance.sourceDomain}`} />
      <Row label="Category" value={provenance.category} />
      <Row label="Published" value={formatTimestamp(provenance.publishedAt)} />
      <Row label="Why it's here" value={provenance.inclusionReason} />
      <Row
        label="Feed last refreshed"
        value={
          provenance.sourceLastRefreshedAt
            ? formatTimestamp(provenance.sourceLastRefreshedAt)
            : "Not yet refreshed this session"
        }
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    title: {
      fontFamily: typography.fontFamily.serifBold,
      fontSize: typography.size.xl,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    row: {
      gap: 2,
    },
    rowLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.xs,
      fontWeight: "700",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    rowValue: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.md,
      color: colors.text,
    },
    emptyText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.md,
      color: colors.textSecondary,
    },
  });
