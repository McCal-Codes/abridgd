import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing } from "../../../theme/spacing";
import { fontScaleLimit, typography } from "../../../theme/typography";
import { ThemeColors } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export type EventsView = "upcoming" | "saved";

interface Props {
  view: EventsView;
  savedCount: number;
  onChange: (view: EventsView) => void;
}

/** "Upcoming | Saved" switch at the top of the Events screen. */
export const EventsViewToggle: React.FC<Props> = ({ view, savedCount, onChange }) => {
  const styles = useThemedStyles(createStyles);
  const savedLabel = savedCount > 0 ? `Saved · ${savedCount}` : "Saved";
  const savedSpoken = `Saved, ${savedCount} ${savedCount === 1 ? "event" : "events"}`;

  const segment = (value: EventsView, label: string, spoken: string, position: number) => {
    const active = view === value;
    return (
      <Pressable
        onPress={() => onChange(value)}
        style={[styles.segment, active && styles.segmentActive]}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${spoken}, tab, ${position} of 2`}
      >
        <Text
          style={[styles.text, active && styles.textActive]}
          maxFontSizeMultiplier={fontScaleLimit.action}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.track} accessibilityRole="tablist">
      {segment("upcoming", "Upcoming", "Upcoming", 1)}
      {segment("saved", savedLabel, savedSpoken, 2)}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    track: {
      flexDirection: "row",
      marginHorizontal: spacing.gutter,
      marginTop: spacing.md,
      padding: 4,
      gap: 4,
      borderRadius: 14,
      backgroundColor: colors.border,
    },
    segment: {
      flex: 1,
      minHeight: 44,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentActive: { backgroundColor: colors.surface },
    text: { fontFamily: typography.fontFamily.sans, fontSize: 14, color: colors.label },
    textActive: { fontWeight: "600" },
  });
