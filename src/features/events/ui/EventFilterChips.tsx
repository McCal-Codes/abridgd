import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { spacing } from "../../../theme/spacing";
import { fontScaleLimit, typography } from "../../../theme/typography";
import { ThemeColors } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { EventFilter, filtersEqual, FilterChip } from "../grouping";

interface Props {
  chips: FilterChip[];
  selected: EventFilter;
  onSelect: (filter: EventFilter) => void;
}

/** A single row of filter chips built from what is actually listed (see `buildFilterChips`). */
export const EventFilterChips: React.FC<Props> = ({ chips, selected, onSelect }) => {
  const styles = useThemedStyles(createStyles);
  if (chips.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {chips.map((chip) => {
        const active = filtersEqual(chip.filter, selected);
        return (
          <Pressable
            key={chip.label}
            onPress={() => onSelect(chip.filter)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={chip.label}
          >
            <Text
              style={[styles.chipText, active && styles.chipTextActive]}
              maxFontSizeMultiplier={fontScaleLimit.action}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: { paddingHorizontal: spacing.gutter, paddingVertical: spacing.md, gap: spacing.sm },
    chip: {
      minHeight: 44,
      paddingHorizontal: spacing.md,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.tintStrong, borderColor: colors.tintStrong },
    chipText: { fontFamily: typography.fontFamily.sans, fontSize: 14, color: colors.label },
    chipTextActive: { color: colors.onTintStrong, fontWeight: "600" },
  });
