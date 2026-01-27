import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfiles, getAchievementStatuses } from "../context/ProfileContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { Trophy, Target, Medal, Sparkles, Flame } from "lucide-react-native";

const AchievementIcon = ({ icon, earned }: { icon?: string; earned?: boolean }) => {
  const color = earned ? colors.tint : colors.textSecondary;
  switch (icon) {
    case "trophy":
      return <Trophy size={22} color={color} strokeWidth={2} />;
    case "medal":
      return <Medal size={22} color={color} strokeWidth={2} />;
    case "target":
      return <Target size={22} color={color} strokeWidth={2} />;
    case "sparkles":
    default:
      return <Sparkles size={22} color={color} strokeWidth={2} />;
  }
};

export const AchievementsScreen: React.FC = () => {
  const { activeProfile } = useProfiles();
  const achievementStatuses = useMemo(
    () => getAchievementStatuses(activeProfile ?? undefined),
    [activeProfile],
  );

  const articlesRead = activeProfile?.stats?.articlesRead || 0;
  const savedActions = activeProfile?.stats?.savedActions || 0;
  const savedCount = activeProfile?.savedArticles?.length || 0;

  const karma = articlesRead * 10 + savedActions * 5 + savedCount * 2;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Achievements</Text>
        <Text style={styles.subheader}>
          Utility-first badges for readers. Progress follows your profile key—no vanity fields.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Flame size={24} color={colors.tint} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Reading karma</Text>
            <Text style={styles.summaryValue}>{karma}</Text>
            <Text style={styles.summaryHint}>
              Based on reads, saves, and saved items. Export your profile to keep progress.
            </Text>
            <View style={styles.progressBar} accessibilityLabel="Karma progress bar">
              <View style={[styles.progressFill, { width: `${Math.min(100, karma / 8)}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>All achievements</Text>
          <Text style={styles.sectionBadge}>{achievementStatuses.length}</Text>
        </View>

        <View style={styles.list}>
          {achievementStatuses.map((item) => (
            <View
              key={item.id}
              style={[styles.item, item.earned && styles.itemEarned]}
              accessibilityLabel={`${item.title} ${item.earned ? "unlocked" : "locked"}`}
              accessibilityHint={item.description}
            >
              <View style={[styles.iconWrap, item.earned && styles.iconWrapEarned]}>
                <AchievementIcon icon={item.icon} earned={item.earned} />
              </View>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressText, item.earned && styles.progressTextEarned]}>
                    {item.progressText}
                  </Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{item.earned ? "Unlocked" : "Locked"}</Text>
                  </View>
                </View>
                <View style={styles.progressBarSmall}>
                  <View
                    style={[styles.progressFillSmall, { width: `${item.progressPercent || 0}%` }]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AchievementsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
  },
  subheader: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.tint}15`,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  summaryTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  summaryHint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.tint,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  sectionBadge: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    marginTop: spacing.sm,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemEarned: {
    borderColor: colors.tint,
    backgroundColor: `${colors.tint}10`,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    marginRight: spacing.md,
  },
  iconWrapEarned: {
    backgroundColor: `${colors.tint}18`,
    borderColor: colors.tint,
  },
  itemTextBlock: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  itemDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  progressText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressTextEarned: {
    color: colors.tint,
    fontWeight: "600",
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  statusPillText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  progressBarSmall: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    overflow: "hidden",
  },
  progressFillSmall: {
    height: "100%",
    backgroundColor: colors.tint,
  },
});
