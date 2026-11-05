import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { spacing } from "../../theme/spacing";
import { fontScaleLimit, typography } from "../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";
import {
  getSourceKey,
  isSourceEnabled,
  loadSourcePreferences,
  SourceOverrideMap,
  updateSourceEnabled,
} from "../../utils/sourcePreferences";
import { getOnboardingSources } from "./steps";
import { StepLayout } from "./StepLayout";

/**
 * Real toggles. Each switch writes the same source preference Settings > News Sources reads, so
 * the choice made here is the feed the app opens with, and it changes immediately.
 */
export const NewsroomsStep: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const sources = React.useMemo(getOnboardingSources, []);
  const [overrides, setOverrides] = React.useState<SourceOverrideMap>({});

  React.useEffect(() => {
    let cancelled = false;
    loadSourcePreferences().then((prefs) => {
      if (!cancelled) setOverrides(prefs.overrides);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onToggle = (index: number, enabled: boolean) => {
    const source = sources[index];
    setOverrides((prev) => ({ ...prev, [getSourceKey(source.category, source.name)]: enabled }));
    void updateSourceEnabled(source.category, source.name, enabled, source.defaultEnabled);
  };

  return (
    <StepLayout
      testID="onboarding-step-newsrooms"
      title="Your newsrooms."
      body="Everything is on to start. Turn off any outlet you don't want. You can change this anytime in Settings."
    >
      <View style={styles.card}>
        {sources.map((source, index) => {
          const enabled = isSourceEnabled(overrides, source.category, source.name, source.defaultEnabled);
          return (
            <View
              key={`${source.category}-${source.name}`}
              style={[styles.row, index < sources.length - 1 && styles.divider]}
            >
              <Text style={styles.name} maxFontSizeMultiplier={fontScaleLimit.control}>
                {source.name}
              </Text>
              <Switch
                value={enabled}
                onValueChange={(next) => onToggle(index, next)}
                accessibilityLabel={`${source.name}`}
                trackColor={{ true: colors.tintStrong }}
              />
            </View>
          );
        })}
      </View>
      <Text style={styles.note} maxFontSizeMultiplier={fontScaleLimit.meta}>
        Each story links back to the outlet that reported it. More outlets are in Settings.
      </Text>
    </StepLayout>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      paddingHorizontal: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    row: { flexDirection: "row", alignItems: "center", minHeight: 52, gap: spacing.sm },
    divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    name: { flex: 1, fontFamily: typography.fontFamily.sans, fontSize: 16, color: colors.label },
    note: {
      marginTop: spacing.sm + 4,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textTertiary,
    },
  });
