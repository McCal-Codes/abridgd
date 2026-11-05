import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarDays, ChevronRight } from "lucide-react-native";
import { spacing } from "../../../theme/spacing";
import { fontScaleLimit, typography } from "../../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { dateBlockParts, describeEvent, formatEventPlace, formatEventTime } from "../format";
import { pickHomeEvents } from "../grouping";
import { useSavedEventsOptional } from "../SavedEventsContext";
import { AppEvent } from "../types";
import { useEvents } from "../useEvents";
import { EventDetailSheet } from "./EventDetailSheet";
import { SaveEventButton } from "./SaveEventButton";

export const HOME_EVENT_COUNT = 3;

interface Props {
  onSeeAll: () => void;
}

/**
 * The "This week" card on Home. A short, bounded look at what is coming up, with a way into the
 * full list. It renders nothing while loading and nothing when there is nothing to show: Home
 * stays calm, and a blank card is never an invitation to refresh.
 */
export const EventsSection: React.FC<Props> = ({ onSeeAll }) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const { events, loading } = useEvents();
  const { isEventSaved, toggleSavedEvent } = useSavedEventsOptional();
  const [open, setOpen] = React.useState<AppEvent | null>(null);

  const rows = React.useMemo(() => pickHomeEvents(events, HOME_EVENT_COUNT), [events]);
  if (loading || rows.length === 0) return null;

  return (
    <View style={styles.card} testID="home-events-section">
      <View style={styles.header}>
        <CalendarDays size={20} color={colors.tintStrong} />
        <Text style={styles.heading} accessibilityRole="header">
          This week
        </Text>
        <View style={styles.spacer} />
        <Text style={styles.range} maxFontSizeMultiplier={fontScaleLimit.meta}>
          Next 14 days
        </Text>
      </View>

      {rows.map((event, index) => {
        const saved = isEventSaved(event.id);
        const { weekday, day } = dateBlockParts(event);
        return (
          <View key={event.id} style={[styles.row, index < rows.length - 1 && styles.rowDivider]}>
            <Pressable
              style={styles.rowBody}
              onPress={() => setOpen(event)}
              accessibilityRole="button"
              accessibilityLabel={describeEvent(event, saved)}
              accessibilityHint="Opens the event details"
            >
              <View style={styles.dateBlock}>
                <Text style={styles.weekday} maxFontSizeMultiplier={fontScaleLimit.meta}>
                  {weekday}
                </Text>
                <Text style={styles.day} maxFontSizeMultiplier={fontScaleLimit.meta}>
                  {day}
                </Text>
              </View>
              <View style={styles.rowText}>
                <Text style={styles.title} numberOfLines={2}>
                  {event.title}
                </Text>
                <Text style={styles.meta} numberOfLines={1} maxFontSizeMultiplier={fontScaleLimit.meta}>
                  {formatEventTime(event)} · {formatEventPlace(event)}
                </Text>
              </View>
            </Pressable>
            <SaveEventButton
              saved={saved}
              title={event.title}
              onPress={() => toggleSavedEvent(event)}
            />
          </View>
        );
      })}

      <Pressable
        onPress={onSeeAll}
        style={styles.seeAll}
        accessibilityRole="button"
        accessibilityLabel="See all events"
      >
        <Text style={styles.seeAllText} maxFontSizeMultiplier={fontScaleLimit.action}>
          See all events
        </Text>
        <ChevronRight size={18} color={colors.tintStrong} />
      </Pressable>

      <EventDetailSheet event={open} onClose={() => setOpen(null)} />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      marginHorizontal: spacing.gutter,
      marginBottom: spacing.md,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    heading: {
      fontFamily: typography.fontFamily.serifSemibold,
      fontSize: typography.size.lg,
      color: colors.label,
    },
    spacer: { flex: 1 },
    range: { fontFamily: typography.fontFamily.sans, fontSize: 12, color: colors.textTertiary },
    row: { flexDirection: "row", alignItems: "center", minHeight: 72 },
    rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    rowBody: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, minHeight: 44 },
    dateBlock: {
      width: 52,
      height: 56,
      borderRadius: 12,
      backgroundColor: colors.tintTransparent,
      alignItems: "center",
      justifyContent: "center",
    },
    weekday: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.5,
      color: colors.tintStrong,
    },
    day: {
      fontFamily: typography.fontFamily.serifBold,
      fontSize: 22,
      lineHeight: 24,
      color: colors.label,
    },
    rowText: { flex: 1, minWidth: 0 },
    title: {
      fontFamily: typography.fontFamily.serifSemibold,
      fontSize: 16,
      lineHeight: 20,
      color: colors.label,
    },
    meta: { marginTop: 2, fontFamily: typography.fontFamily.sans, fontSize: 13, color: colors.textSecondary },
    seeAll: {
      minHeight: 48,
      marginHorizontal: -spacing.md,
      paddingHorizontal: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    seeAllText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 15,
      fontWeight: "600",
      color: colors.tintStrong,
    },
  });
