import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { HeartHandshake } from "lucide-react-native";
import { useSettings } from "../../context/SettingsContext";
import { spacing } from "../../theme/spacing";
import { fontScaleLimit, typography } from "../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../theme/ThemeContext";
import { useThemedStyles } from "../../theme/useThemedStyles";
import { choiceFromSettings, HeavyStoriesChoice } from "./steps";
import { StepLayout } from "./StepLayout";

const GROUNDING_STYLES = [
  { id: "simple", label: "Calm loop" },
  { id: "waves", label: "Wave drift" },
  { id: "pulse", label: "Focus pulse" },
] as const;

const OPTIONS: { id: HeavyStoriesChoice; title: string; body: string }[] = [
  {
    id: "notes",
    title: "Content notes only",
    body: "A short note before heavy stories. You decide what to do each time.",
  },
  {
    id: "pause",
    title: "Add a breathing pause",
    body: "About 30 seconds of slow breathing before the hardest stories. Skip it any time.",
  },
  { id: "off", title: "Turn it all off", body: "No notes, no pauses. Read straight through." },
];

/**
 * Three choices mapped onto the existing content-note settings. The selected option is read from
 * the settings, not kept in local state, so reopening this step shows what is actually in effect.
 */
export const HeavyStoriesStep: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const {
    isGroundingEnabled,
    setIsGroundingEnabled,
    sensitivePromptLevel,
    setSensitivePromptLevel,
    sensitiveActionPreference,
    setSensitiveActionPreference,
    groundingAnimationStyle,
    setGroundingAnimationStyle,
  } = useSettings();

  const choice = choiceFromSettings({ isGroundingEnabled, sensitivePromptLevel, sensitiveActionPreference });

  const select = async (next: HeavyStoriesChoice) => {
    if (next === "off") {
      await setSensitivePromptLevel("off");
      return;
    }
    // Turning notes back on must undo "off" completely: the article gate needs both.
    if (!isGroundingEnabled) await setIsGroundingEnabled(true);
    if (sensitivePromptLevel === "off") await setSensitivePromptLevel("full");
    await setSensitiveActionPreference(next === "pause" ? "ground-first" : "decide");
  };

  return (
    <StepLayout
      testID="onboarding-step-heavy-stories"
      title="Heavy stories, handled gently."
      body="Some local news is hard to read. A content note tells you what a story holds before you open it. You choose what happens next."
    >
      <View style={styles.options} accessibilityRole="radiogroup">
        {OPTIONS.map((option) => {
          const selected = choice === option.id;
          return (
            <Pressable
              key={option.id}
              testID={`onboarding-heavy-${option.id}`}
              onPress={() => void select(option.id)}
              style={[styles.option, selected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              accessibilityLabel={`${option.title}. ${option.body}`}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle} maxFontSizeMultiplier={fontScaleLimit.control}>
                  {option.title}
                </Text>
                <Text style={styles.optionBody} maxFontSizeMultiplier={fontScaleLimit.meta}>
                  {option.body}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {choice === "pause" ? (
        <View style={styles.styleRow} testID="onboarding-grounding-styles">
          {GROUNDING_STYLES.map((style) => {
            const selected = groundingAnimationStyle === style.id;
            return (
              <Pressable
                key={style.id}
                testID={`onboarding-grounding-${style.id}`}
                onPress={() => void setGroundingAnimationStyle(style.id)}
                style={[styles.chip, selected && styles.chipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${style.label} breathing style`}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                  maxFontSizeMultiplier={fontScaleLimit.action}
                >
                  {style.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Text style={styles.note} maxFontSizeMultiplier={fontScaleLimit.meta}>
        {"Not sure? Keep the first one. This is optional and reversible: Settings > Reading."}
      </Text>

      <View style={styles.help}>
        <HeartHandshake size={20} color={colors.tintStrong} />
        <Text style={styles.helpText} maxFontSizeMultiplier={fontScaleLimit.meta}>
          {"If a story is hitting close to home, local help is one tap away in Settings > Resources."}
        </Text>
      </View>
    </StepLayout>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    options: { gap: 10 },
    option: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: spacing.md - 2,
      minHeight: 44,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionSelected: { borderWidth: 2, borderColor: colors.tintStrong },
    radio: {
      width: 22,
      height: 22,
      marginTop: 1,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.opaqueSeparator,
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: { borderColor: colors.tintStrong },
    radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.tintStrong },
    optionText: { flex: 1 },
    optionTitle: { fontFamily: typography.fontFamily.sans, fontSize: 16, fontWeight: "600", color: colors.label },
    optionBody: {
      marginTop: 2,
      fontFamily: typography.fontFamily.sans,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    styleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.md - 4 },
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
    chipSelected: { backgroundColor: colors.tintStrong, borderColor: colors.tintStrong },
    chipText: { fontFamily: typography.fontFamily.sans, fontSize: 14, color: colors.label },
    chipTextSelected: { color: colors.onTintStrong, fontWeight: "600" },
    note: {
      marginTop: spacing.md,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textTertiary,
    },
    help: {
      marginTop: spacing.md - 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: spacing.md - 2,
      borderRadius: 14,
      backgroundColor: colors.tintTransparent,
    },
    helpText: { flex: 1, fontFamily: typography.fontFamily.sans, fontSize: 14, lineHeight: 20, color: colors.label },
  });
