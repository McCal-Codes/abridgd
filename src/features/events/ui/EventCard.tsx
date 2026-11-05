import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Clock, MapPin } from "lucide-react-native";
import { spacing } from "../../../theme/spacing";
import { fontScaleLimit, typography } from "../../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { describeEvent, formatEventPlace, formatEventTime } from "../format";
import { AppEvent } from "../types";
import { SaveEventButton } from "./SaveEventButton";

interface Props {
  event: AppEvent;
  saved: boolean;
  onPress: (event: AppEvent) => void;
  onToggleSave: (event: AppEvent) => void;
}

export const EventCard: React.FC<Props> = React.memo(({ event, saved, onPress, onToggleSave }) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.body}
        onPress={() => onPress(event)}
        accessibilityRole="button"
        accessibilityLabel={describeEvent(event, saved)}
        accessibilityHint="Opens the event details"
      >
        <Text style={styles.title} numberOfLines={3}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.meta} maxFontSizeMultiplier={fontScaleLimit.meta}>
            {formatEventTime(event)}
          </Text>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={[styles.meta, styles.metaFlex]} numberOfLines={1} maxFontSizeMultiplier={fontScaleLimit.meta}>
            {formatEventPlace(event)}
          </Text>
        </View>
        <Text style={styles.source} maxFontSizeMultiplier={fontScaleLimit.meta}>
          Listed by {event.sourceName}
        </Text>
      </Pressable>
      <SaveEventButton saved={saved} title={event.title} onPress={() => onToggleSave(event)} />
    </View>
  );
});
EventCard.displayName = "EventCard";

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginHorizontal: spacing.gutter,
      marginBottom: spacing.sm + 2,
      paddingLeft: 14,
      paddingRight: spacing.xs,
      paddingVertical: spacing.xs,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    body: { flex: 1, minWidth: 0, paddingVertical: 10, minHeight: 44 },
    title: {
      fontFamily: typography.fontFamily.serifSemibold,
      fontSize: 17,
      lineHeight: 22,
      color: colors.label,
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    meta: { fontFamily: typography.fontFamily.sans, fontSize: 13, color: colors.textSecondary },
    metaFlex: { flexShrink: 1 },
    source: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 6,
    },
  });
