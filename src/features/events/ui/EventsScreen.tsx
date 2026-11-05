import React from "react";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarDays } from "lucide-react-native";
import { FeedStatusBanner } from "../../../components/FeedStatusBanner";
import { HeroHeader } from "../../../components/HeroHeader";
import { Skeleton } from "../../../components/Skeleton";
import { useReduceMotion } from "../../../hooks/useReduceMotion";
import { spacing } from "../../../theme/spacing";
import { fontScaleLimit, typography } from "../../../theme/typography";
import { ThemeColors } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { announceForAccessibility } from "../../../utils/announce";
import { formatUpdatedAgo } from "../../../utils/relativeTime";
import {
  ALL_FILTER,
  applyFilter,
  buildFilterChips,
  EventFilter,
  filtersEqual,
  groupByDay,
} from "../grouping";
import { useSavedEventsOptional } from "../SavedEventsContext";
import { AppEvent } from "../types";
import { useEvents } from "../useEvents";
import { EventCard } from "./EventCard";
import { EventDetailSheet } from "./EventDetailSheet";
import { EventFilterChips } from "./EventFilterChips";

const SkeletonCards = () => {
  const styles = useThemedStyles(createStyles);
  // Skeleton blocks pulse forever; a reader who asked for less motion gets still placeholders.
  const reduceMotion = useReduceMotion();
  const Block = ({ width, height }: { width: `${number}%`; height: number }) =>
    reduceMotion ? (
      <View style={[styles.skeletonBlock, { width, height }]} />
    ) : (
      <Skeleton width={width} height={height} />
    );
  return (
    <View testID="events-skeleton" accessibilityLabel="Loading events" accessibilityRole="progressbar">
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Block width="62%" height={16} />
          <View style={styles.skeletonGap} />
          <Block width="44%" height={12} />
        </View>
      ))}
    </View>
  );
};

export const EventsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { events, loading, refreshing, error, stale, failedSources, lastUpdated, refresh } = useEvents();
  const { isEventSaved, toggleSavedEvent } = useSavedEventsOptional();
  const [filter, setFilter] = React.useState<EventFilter>(ALL_FILTER);
  const [open, setOpen] = React.useState<AppEvent | null>(null);

  const chips = React.useMemo(() => buildFilterChips(events, Date.now()), [events]);
  // If the chosen chip no longer exists in the data (a refresh removed that area), show everything.
  const activeFilter = chips.some((chip) => filtersEqual(chip.filter, filter)) ? filter : ALL_FILTER;
  const sections = React.useMemo(
    () =>
      groupByDay(applyFilter(events, activeFilter, Date.now()), Date.now()).map((group) => ({
        title: group.label,
        data: group.events,
      })),
    [events, activeFilter],
  );

  const onRefresh = async () => {
    const outcome = await refresh();
    announceForAccessibility(
      outcome.failed
        ? "Couldn't refresh every calendar. Showing what is already loaded."
        : outcome.count === 1
          ? "1 event"
          : `${outcome.count} events`,
    );
  };

  const subtitle = ["Pittsburgh, next 14 days", formatUpdatedAgo(lastUpdated)].filter(Boolean).join(" · ");

  const header = (
    <View>
      <HeroHeader title="Events" subtitle={subtitle} Icon={CalendarDays} />
      {error && events.length === 0 ? null : failedSources.length > 0 ? (
        <FeedStatusBanner
          testID="events-status"
          message={`Couldn't reach ${failedSources.join(", ")}. Showing what we have.`}
        />
      ) : stale ? (
        <FeedStatusBanner testID="events-status" message="Showing your last saved events while we check for new ones." />
      ) : null}
      <EventFilterChips chips={chips} selected={activeFilter} onSelect={setFilter} />
    </View>
  );

  const footer =
    sections.length > 0 ? (
      <View style={styles.footer} testID="events-end">
        <Text style={styles.footerTitle}>That's everything for the next 14 days.</Text>
        <Text style={styles.footerNote} maxFontSizeMultiplier={fontScaleLimit.meta}>
          Listings come from each organizer's public calendar. Check the source for changes.
        </Text>
      </View>
    ) : null;

  let empty: React.ReactNode = null;
  if (loading) {
    empty = <SkeletonCards />;
  } else if (error && events.length === 0) {
    empty = (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Couldn't load events.</Text>
        <Text style={styles.emptyBody}>Check your connection and pull down to try again.</Text>
      </View>
    );
  } else if (sections.length === 0) {
    empty = (
      <View style={styles.centered}>
        <CalendarDays size={32} color={styles.emptyIcon.color} />
        <Text style={styles.emptyTitle}>
          {activeFilter.kind === "all" ? "Nothing listed for the next 14 days." : "Nothing here right now."}
        </Text>
        <Text style={styles.emptyBody}>
          {activeFilter.kind === "all"
            ? "That's all the events our sources have for now. Check back tomorrow."
            : "Try All to see everything that is listed."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <SectionList
        testID="events-list"
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={footer}
        renderSectionHeader={({ section }) => (
          <Text style={styles.dayHeader} accessibilityRole="header" maxFontSizeMultiplier={fontScaleLimit.meta}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            saved={isEventSaved(item.id)}
            onPress={setOpen}
            onToggleSave={toggleSavedEvent}
          />
        )}
        contentContainerStyle={{ paddingBottom: spacing.xl + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        initialNumToRender={8}
        windowSize={9}
        extraData={isEventSaved}
      />
      <EventDetailSheet event={open} onClose={() => setOpen(null)} />
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    dayHeader: {
      marginHorizontal: spacing.gutter,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color: colors.textSecondary,
    },
    skeletonCard: {
      marginHorizontal: spacing.gutter,
      marginBottom: spacing.sm + 2,
      height: 84,
      padding: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    skeletonBlock: { borderRadius: 8, backgroundColor: colors.secondaryBackground },
    skeletonGap: { height: 12 },
    centered: { alignItems: "center", paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.sm },
    emptyIcon: { color: colors.textTertiary },
    emptyTitle: {
      textAlign: "center",
      fontFamily: typography.fontFamily.serifSemibold,
      fontSize: 19,
      color: colors.label,
    },
    emptyBody: {
      textAlign: "center",
      fontFamily: typography.fontFamily.sans,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSecondary,
    },
    footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, alignItems: "center" },
    footerTitle: {
      textAlign: "center",
      fontFamily: typography.fontFamily.serifSemibold,
      fontSize: 17,
      color: colors.label,
    },
    footerNote: {
      marginTop: spacing.xs + 2,
      textAlign: "center",
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textTertiary,
    },
  });
